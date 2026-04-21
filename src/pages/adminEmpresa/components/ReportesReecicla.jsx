import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaFilePdf, FaFileExcel, FaChartPie, FaMobileAlt, FaRecycle, FaClipboardCheck, FaDownload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';

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
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color: colorMap[color] || colorMap.default }}>
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
    <div style={styles.repCard}>
      <div style={styles.repIcon}>{icon}</div>
      <div>
        <div style={styles.repTitulo}>{titulo}</div>
        <div style={styles.repDesc}>{descripcion}</div>
      </div>
      <div style={styles.btnRow}>
        <button style={styles.btnPDF} onClick={handlePDF} disabled={loading || loadingPDF}>
          <FaFilePdf size={12} />
          {loadingPDF ? 'Generando...' : 'PDF'}
        </button>
        <button style={styles.btnExcel} onClick={handleExcel} disabled={loading || loadingExcel}>
          <FaFileExcel size={12} />
          {loadingExcel ? 'Generando...' : 'Excel'}
        </button>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const ReportesReecicla = () => {
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatMoneda = (valor, moneda = 'BOB') => {
    if (valor == null) return '—';
    return valor.toLocaleString('es-BO', { style: 'currency', currency: moneda, maximumFractionDigits: 0 });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Reportes Reecicla</h1>
          <p style={styles.subtitle}>Estadísticas de cotizaciones e inspecciones</p>
        </div>
        <button style={styles.btnRefresh} onClick={cargarDatos} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar datos'}
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <StatCard label="Total cotizaciones" value={resumen?.total}       color="blue"  />
        <StatCard label="Aceptadas"          value={resumen?.aceptadas}   color="green" />
        <StatCard label="Pendientes"         value={resumen?.pendientes}  color="amber" />
        <StatCard label="Rechazadas"         value={resumen?.rechazadas}  color="red"   />
        <StatCard label="Monto total"        value={formatMoneda(resumen?.montoTotalFinal, resumen?.moneda)} />
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
                {l}
              </span>
            ))}
          </div>
          <div style={{ position: 'relative', height: 220 }}>
            <canvas ref={chartEstadosRef} role="img" aria-label="Gráfico donut de estados de cotizaciones" />
          </div>
        </div>

        {/* Barras dispositivos */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>
            <FaMobileAlt size={14} style={{ marginRight: 6, color: '#1D9E75' }} />
            Dispositivos más cotizados
          </div>
          <div style={styles.legend}>
            {['#1D9E75', '#185FA5', '#BA7517', '#A32D2D', '#533AB7'].map((c, i) => (
              dispositivos[i] && (
                <span key={c} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: c }} />
                  {dispositivos[i].nombre}
                </span>
              )
            ))}
          </div>
          <div style={{ position: 'relative', height: 220 }}>
            <canvas ref={chartDispRef} role="img" aria-label="Gráfico de dispositivos más cotizados" />
          </div>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div style={styles.filtersBar}>
        <span style={styles.filtersLabel}>Período del reporte</span>
        <label style={styles.filterLabel}>
          Desde&nbsp;
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            style={styles.dateInput}
          />
        </label>
        <label style={styles.filterLabel}>
          Hasta&nbsp;
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            style={styles.dateInput}
          />
        </label>
      </div>

      {/* Cards de reportes */}
      <div style={styles.repGrid}>
        <ReporteCard
          icon={<FaRecycle color="#0F6E56" size={18} />}
          titulo="Flujo de trabajo"
          descripcion="Reporte completo del flujo de dispositivos, etapas y tiempos de procesamiento"
          mutation="generarReporteFlujo"
          onGenerar={handleGenerarReporte}
          loading={loadingReporte}
        />
        <ReporteCard
          icon={<span style={{ fontSize: 18, color: '#185FA5' }}>$</span>}
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
        <div style={styles.ultimoReporte}>
          <div style={styles.ultimoTitulo}>
            <FaDownload size={13} style={{ marginRight: 6 }} />
            Último reporte generado
          </div>
          <div style={styles.ultimoInfo}>
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
            style={styles.downloadLink}
          >
            Descargar {ultimoReporte.formato}
          </a>
        </div>
      )}
    </div>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = {
  container:    { padding: '1.5rem', fontFamily: 'inherit', color: 'inherit', maxWidth: 1100 },
  header:       { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
  h1:           { fontSize: 22, fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center' },
  subtitle:     { fontSize: 14, color: '#888', marginTop: 4 },
  btnRefresh:   { fontSize: 13, padding: '6px 14px', border: '0.5px solid #ccc', borderRadius: 8, background: 'transparent', cursor: 'pointer' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: '1.75rem' },
  statCard:     { background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: '1rem' },
  statLabel:    { fontSize: 12, color: '#888', marginBottom: 6 },
  statValue:    { fontSize: 22, fontWeight: 500 },
  chartsRow:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' },
  chartCard:    { background: 'white', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '1rem 1.25rem' },
  chartTitle:   { fontSize: 14, fontWeight: 500, marginBottom: '0.75rem', display: 'flex', alignItems: 'center' },
  legend:       { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  legendItem:   { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666' },
  legendDot:    { width: 10, height: 10, borderRadius: 2, flexShrink: 0 },
  filtersBar:   { background: 'rgba(0,0,0,0.03)', borderRadius: 8, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: '1.25rem' },
  filtersLabel: { fontSize: 13, fontWeight: 500 },
  filterLabel:  { fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 6 },
  dateInput:    { fontSize: 13, padding: '4px 8px', borderRadius: 6, border: '0.5px solid #ccc', background: 'white' },
  repGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  repCard:      { background: 'white', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 },
  repIcon:      { width: 38, height: 38, borderRadius: 8, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  repTitulo:    { fontSize: 14, fontWeight: 500, marginBottom: 4 },
  repDesc:      { fontSize: 12, color: '#888', lineHeight: 1.5 },
  btnRow:       { display: 'flex', gap: 8, marginTop: 'auto' },
  btnPDF:       { fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '0.5px solid #A32D2D', background: 'transparent', cursor: 'pointer', color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 4 },
  btnExcel:     { fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '0.5px solid #3B6D11', background: 'transparent', cursor: 'pointer', color: '#3B6D11', display: 'flex', alignItems: 'center', gap: 4 },
  ultimoReporte:{ background: 'rgba(29,158,117,0.06)', border: '0.5px solid rgba(29,158,117,0.3)', borderRadius: 8, padding: '0.875rem 1rem' },
  ultimoTitulo: { fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#0F6E56', display: 'flex', alignItems: 'center' },
  ultimoInfo:   { fontSize: 13, color: '#555', marginBottom: 6 },
  downloadLink: { fontSize: 13, color: '#185FA5' },
};

export default ReportesReecicla;
