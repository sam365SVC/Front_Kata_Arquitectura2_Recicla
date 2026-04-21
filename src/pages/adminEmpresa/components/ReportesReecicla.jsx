Chart.register(...registerables);

const GQL_URL = 'http://localhost:4009/graphql';
const TENANT_ID = 7;

async function callGQL(query, variables = {}) {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ─── Queries / Mutations ──────────────────────────────────────────────────────

const Q_RESUMEN = `
  query {
    resumenCotizaciones(filtro: { tenantId: ${TENANT_ID} }) {
      total aceptadas pendientes rechazadas montoTotalFinal moneda
    }
  }
`;

const Q_DISPOSITIVOS = `
  query {
    dispositivosMasCotizados(filtro: { tenantId: ${TENANT_ID} }) {
      nombre totalSolicitudes montoPromedio
    }
  }
`;

const M_GENERAR = (mutation) => `
  mutation GenerarReporte($filtro: FiltroReporte!) {
    ${mutation}(filtro: $filtro) {
      fileName
      downloadUrl
      formato
      generadoEn
      metadata { totalRegistros tipoReporte }
    }
  }
`;
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';
import styles from "./ReportesReecicla.module.scss";
import {
  fetchDatosReportes,
  generarReporte,
} from '../slicesReportes/ReportesThunk';
import {
  selectResumen,
  selectDispositivos,
  selectUltimoReporte,
  selectReportesLoading,
  selectLoadingReporte,
  selectReportesError,
  selectErrorReporte,
  clearReportesError,
  clearErrorReporte,
  clearUltimoReporte,
} from '../slicesReportes/ReportesSlice';

Chart.register(...registerables);

const GQL_BASE = 'http://localhost:4009';

// ─── Componente de tarjeta de estadística ─────────────────────────────────────

const StatCard = ({ label, value, color }) => {
  const colorMap = {
    blue: '#185FA5',
    green: '#3B6D11',
    amber: '#854F0B',
    red: '#A32D2D',
    default: 'inherit',
  };
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={{ ...styles.statValue, color: colorMap[color] || colorMap.default }}>
        {value ?? '—'}
      </div>
    </div>
  );
};

// ─── Componente de tarjeta de reporte ─────────────────────────────────────────

const ReporteCard = ({ icon, titulo, descripcion, mutation, onGenerar, loading }) => {
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handlePDF = async () => {
    setLoadingPDF(true);
    await onGenerar(`${mutation}PDF`);
    setLoadingPDF(false);
  };

  const handleExcel = async () => {
    setLoadingExcel(true);
    await onGenerar(`${mutation}Excel`);
    setLoadingExcel(false);
  };

  return (
    <div className={styles.repCard}>
      <div className={styles.repIcon}>{icon}</div>
      <div>
        <div className={styles.repTitulo}>{titulo}</div>
        <div className={styles.repDesc}>{descripcion}</div>
      </div>
      <div className={styles.btnRow}>
        <button className={styles.btnPDF} onClick={handlePDF} disabled={loading || loadingPDF}>
          <FaFilePdf size={12} />
          {loadingPDF ? 'Generando...' : 'PDF'}
        </button>
        <button className={styles.btnExcel} onClick={handleExcel} disabled={loading || loadingExcel}>
          <FaFileExcel size={12} />
          {loadingExcel ? 'Generando...' : 'Excel'}
        </button>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const ReportesReecicla = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('2026-01-01');
  const [fechaHasta, setFechaHasta] = useState('2026-12-31');
  const [ultimoReporte, setUltimoReporte] = useState(null);

  const chartEstadosRef = useRef(null);
  const chartDispRef = useRef(null);
  const chartEstadosInstance = useRef(null);
  const chartDispInstance = useRef(null);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Renderizar gráficos cuando lleguen los datos
  const dispatch = useDispatch();

  // ── Selectores Redux ──────────────────────────────────────────────────────
  const resumen        = useSelector(selectResumen);
  const dispositivos   = useSelector(selectDispositivos);
  const ultimoReporte  = useSelector(selectUltimoReporte);
  const loading        = useSelector(selectReportesLoading);
  const loadingReporte = useSelector(selectLoadingReporte);
  const error          = useSelector(selectReportesError);
  const errorReporte   = useSelector(selectErrorReporte);

  // ── Estado local (solo UI) ────────────────────────────────────────────────
  const [fechaDesde, setFechaDesde] = useState('2026-01-01');
  const [fechaHasta, setFechaHasta] = useState('2026-12-31');

  const chartEstadosRef      = useRef(null);
  const chartDispRef         = useRef(null);
  const chartEstadosInstance = useRef(null);
  const chartDispInstance    = useRef(null);

  // ── Cargar datos al montar ────────────────────────────────────────────────
  useEffect(() => {
    cargarDatos();
    return () => {
      chartEstadosInstance.current?.destroy();
      chartDispInstance.current?.destroy();
    };
  }, []);

  // ── Renderizar gráficos cuando lleguen los datos ──────────────────────────
  useEffect(() => {
    if (resumen) renderChartEstados();
  }, [resumen]);

  useEffect(() => {
    if (dispositivos.length) renderChartDispositivos();
  }, [dispositivos]);

  const cargarDatos = async () => {
    try {
      const [dataResumen, dataDisp] = await Promise.all([
        callGQL(Q_RESUMEN),
        callGQL(Q_DISPOSITIVOS),
      ]);
      setResumen(dataResumen.resumenCotizaciones);
      setDispositivos(dataDisp.dispositivosMasCotizados || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      // Datos de demostración si el microservicio no responde
      setResumen({ total: 85, aceptadas: 42, pendientes: 31, rechazadas: 12, montoTotalFinal: 48500, moneda: 'BOB' });
      setDispositivos([
        { nombre: 'Smartphone', totalSolicitudes: 55, montoPromedio: 380 },
        { nombre: 'Laptop', totalSolicitudes: 38, montoPromedio: 720 },
        { nombre: 'Tablet', totalSolicitudes: 22, montoPromedio: 290 },
        { nombre: 'Smart TV', totalSolicitudes: 17, montoPromedio: 510 },
        { nombre: 'Consola', totalSolicitudes: 9, montoPromedio: 430 },
      ]);
    }
  };

  const renderChartEstados = () => {
    if (!chartEstadosRef.current || !resumen) return;
    if (chartEstadosInstance.current) chartEstadosInstance.current.destroy();
  // ── Mostrar error global en Swal ──────────────────────────────────────────
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos',
        text: error,
        confirmButtonColor: '#1D9E75',
      }).then(() => dispatch(clearReportesError()));
    }
  }, [error]);

  // ── Mostrar error de reporte en Swal ──────────────────────────────────────
  useEffect(() => {
    if (errorReporte) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorReporte,
        confirmButtonColor: '#1D9E75',
      }).then(() => dispatch(clearErrorReporte()));
    }
  }, [errorReporte]);

  // ── Acciones ──────────────────────────────────────────────────────────────

  const cargarDatos = () => {
    dispatch(fetchDatosReportes());
  };

  const handleGenerarReporte = async (mutation) => {
    Swal.fire({
      title: 'Generando reporte...',
      html: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const result = await dispatch(
      generarReporte({ mutation, fechaDesde, fechaHasta })
    );

    // Si fue rechazado, el useEffect de errorReporte mostrará el error
    if (generarReporte.rejected.match(result)) return;

    const resultado = result.payload;
    Swal.close();

    await Swal.fire({
      icon: 'success',
      title: 'Reporte listo',
      html: `
        <p><strong>${resultado.fileName}</strong></p>
        <p style="font-size:13px;color:#666">
          ${resultado.metadata?.totalRegistros ?? '?'} registros ·
          ${new Date(resultado.generadoEn).toLocaleString()}
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: '<span>Descargar</span>',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#1D9E75',
      cancelButtonColor: '#888',
    }).then((res) => {
      if (res.isConfirmed) {
        window.open(`${GQL_BASE}${resultado.downloadUrl}`, '_blank');
      }
    });
  };

  // ── Gráficos ──────────────────────────────────────────────────────────────

  const renderChartEstados = () => {
    if (!chartEstadosRef.current || !resumen) return;
    chartEstadosInstance.current?.destroy();
    chartEstadosInstance.current = new Chart(chartEstadosRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Aceptadas', 'Pendientes', 'Rechazadas'],
        datasets: [{
          data: [resumen.aceptadas || 0, resumen.pendientes || 0, resumen.rechazadas || 0],
          backgroundColor: ['#185FA5', '#BA7517', '#A32D2D'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } },
      },
    });
  };

  const renderChartDispositivos = () => {
    if (!chartDispRef.current || !dispositivos.length) return;
    if (chartDispInstance.current) chartDispInstance.current.destroy();
    chartDispInstance.current?.destroy();
    const colores = ['#1D9E75', '#185FA5', '#BA7517', '#A32D2D', '#533AB7'];
    const top5 = dispositivos.slice(0, 5);
    chartDispInstance.current = new Chart(chartDispRef.current, {
      type: 'bar',
      data: {
        labels: top5.map((d) => d.nombre),
        datasets: [{
          label: 'Solicitudes',
          data: top5.map((d) => d.totalSolicitudes),
          backgroundColor: colores,
          borderRadius: 4,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(120,120,120,0.08)' }, ticks: { font: { size: 11 } } },
          y: { grid: { display: false }, ticks: { font: { size: 12 } } },
        },
      },
    });
  };

  const generarReporte = async (mutation) => {
    setLoading(true);
    try {
      Swal.fire({
        title: 'Generando reporte...',
        html: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const data = await callGQL(M_GENERAR(mutation), {
        filtro: { tenantId: TENANT_ID, fechaDesde, fechaHasta },
      });

      const resultado = data[mutation];
      setUltimoReporte(resultado);
      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Reporte listo',
        html: `
          <p><strong>${resultado.fileName}</strong></p>
          <p style="font-size:13px;color:#666">${resultado.metadata?.totalRegistros ?? '?'} registros · ${new Date(resultado.generadoEn).toLocaleString()}</p>
        `,
        showCancelButton: true,
        confirmButtonText: '<span>Descargar</span>',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#1D9E75',
        cancelButtonColor: '#888',
      }).then((res) => {
        if (res.isConfirmed) {
          window.open(`http://localhost:4009${resultado.downloadUrl}`, '_blank');
        }
      });
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo generar el reporte',
        confirmButtonColor: '#1D9E75',
      });
    } finally {
      setLoading(false);
    }
  };
  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatMoneda = (valor, moneda = 'BOB') => {
    if (valor == null) return '—';
    return valor.toLocaleString('es-BO', { style: 'currency', currency: moneda, maximumFractionDigits: 0 });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>
            <FaRecycle style={{ marginRight: 10, color: '#1D9E75' }} />
            Reportes Reecicla
          </h1>
          <p style={styles.subtitle}>Estadísticas de cotizaciones e inspecciones · Tenant {TENANT_ID}</p>
        </div>
        <button style={styles.btnRefresh} onClick={cargarDatos}>
          Actualizar datos
  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.hero}>
          <div>
            <span className={styles.hero__eyebrow}>Reportes</span>
            <h2>Reportes Recicla</h2>
            <p>Visualiza estadísticas y genera reportes en PDF o Excel</p>
          </div>
        </div>
        <button className={styles.btnRefresh} onClick={cargarDatos} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar datos'}
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <StatCard label="Total cotizaciones" value={resumen?.total} color="blue" />
        <StatCard label="Aceptadas" value={resumen?.aceptadas} color="green" />
        <StatCard label="Pendientes" value={resumen?.pendientes} color="amber" />
        <StatCard label="Rechazadas" value={resumen?.rechazadas} color="red" />
        <StatCard label="Monto total" value={formatMoneda(resumen?.montoTotalFinal, resumen?.moneda)} />
      </div>

      {/* Gráficos */}
      <div style={styles.chartsRow}>
        {/* Donut estados */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>
            <FaChartPie size={14} style={{ marginRight: 6, color: '#185FA5' }} />
            Estado de cotizaciones
          </div>
          <div style={styles.legend}>
            {[['#185FA5', 'Aceptadas'], ['#BA7517', 'Pendientes'], ['#A32D2D', 'Rechazadas']].map(([c, l]) => (
              <span key={l} style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: c }} />
      <div className={styles.statsGrid}>
        <StatCard label="Total cotizaciones" value={resumen?.total}       color="blue"  />
        <StatCard label="Aceptadas"          value={resumen?.aceptadas}   color="green" />
        <StatCard label="Pendientes"         value={resumen?.pendientes}  color="amber" />
        <StatCard label="Rechazadas"         value={resumen?.rechazadas}  color="red"   />
        <StatCard label="Monto total"        value={formatMoneda(resumen?.montoTotalFinal, resumen?.moneda)} />
      </div>

      {/* Gráficos */}
      <div className={styles.chartsRow}>
        {/* Donut estados */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <FaChartPie size={14} className={{ marginRight: 6, color: '#185FA5' }} />
            Estado de cotizaciones
          </div>
          <div className={styles.legend}>
            {[['#185FA5', 'Aceptadas'], ['#BA7517', 'Pendientes'], ['#A32D2D', 'Rechazadas']].map(([c, l]) => (
              <span key={l} className={styles.legendItem}>
                <span 
                  className={styles.legendDot} 
                  style={{ background: c }} 
                />
                {l}
              </span>
            ))}
          </div>
          <div className={{ position: 'relative', height: 220 }}>
            <canvas ref={chartEstadosRef} role="img" aria-label="Gráfico donut de estados de cotizaciones" />
          </div>
        </div>

        {/* Barras dispositivos */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <FaMobileAlt size={14} className={{ marginRight: 6, color: '#1D9E75' }} />
            Dispositivos más cotizados
          </div>
          <div className={styles.legend}>
            {['#1D9E75', '#185FA5', '#BA7517', '#A32D2D', '#533AB7'].map((c, i) => (
              dispositivos[i] && (
                <span key={c} className={styles.legendItem}>
                  <span 
                    className={styles.legendDot} 
                    style={{ background: c }} 
                  />
                  {dispositivos[i].nombre}
                </span>
              )
            ))}
          </div>
          <div className={{ position: 'relative', height: 220 }}>
            <canvas ref={chartDispRef} role="img" aria-label="Gráfico de dispositivos más cotizados" />
          </div>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className={styles.filtersBar}>
        <span className={styles.filtersLabel}>Período del reporte</span>
        <label className={styles.filterLabel}>
          Desde&nbsp;
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className={styles.dateInput}
          />
        </label>
        <label className={styles.filterLabel}>
          Hasta&nbsp;
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className={styles.dateInput}
          />
        </label>
      </div>

      {/* Cards de reportes */}
      <div className={styles.repGrid}>
        <ReporteCard
          icon={<FaRecycle color="#0F6E56" size={18} />}
          titulo="Flujo de trabajo"
          descripcion="Reporte completo del flujo de dispositivos, etapas y tiempos de procesamiento"
          mutation="generarReporteFlujo"
          onGenerar={handleGenerarReporte}
          loading={loadingReporte}
        />
        <ReporteCard
          icon={<span className={{ fontSize: 18, color: '#185FA5' }}>$</span>}
          titulo="Cotizaciones"
          descripcion="Detalle de cotizaciones aceptadas, pendientes y rechazadas con montos"
          mutation="generarReporteCotizaciones"
          onGenerar={handleGenerarReporte}
          loading={loadingReporte}
        />
        <ReporteCard
          icon={<FaClipboardCheck color="#854F0B" size={18} />}
          titulo="Inspecciones"
          descripcion="Registro de inspecciones técnicas realizadas y sus resultados"
          mutation="generarReporteInspecciones"
          onGenerar={handleGenerarReporte}
          loading={loadingReporte}
        />
      </div>

      {/* Último reporte generado */}
      {ultimoReporte && (
        <div className={styles.ultimoReporte}>
          <div className={styles.ultimoTitulo}>
            <FaDownload size={13} className={{ marginRight: 6 }} />
            Último reporte generado
          </div>
          <div className={styles.ultimoInfo}>
            <strong>{ultimoReporte.fileName}</strong>
            {' · '}
            {ultimoReporte.metadata?.totalRegistros ?? '?'} registros
            {' · '}
            {new Date(ultimoReporte.generadoEn).toLocaleString()}
          </div>
          <a
            href={`${GQL_BASE}${ultimoReporte.downloadUrl}`}
            target="_blank"
            rel="noreferrer"
            className={styles.downloadLink}
          >
            Descargar {ultimoReporte.formato}
          </a>
        </div>
      )}
    </div>
  );
};



export default ReportesReecicla;
