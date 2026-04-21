import React, { useMemo, useState } from "react";
import {
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiX,
  FiEye,
  FiTrendingUp,
  FiCalendar,
  FiClipboard,
  FiCreditCard,
  FiBriefcase,
  FiLayers,
} from "react-icons/fi";
import styles from "./IngresosServicio.module.scss";

const MOCK_INGRESOS = [
  {
    _id: "ING-001",
    fechaPago: "2026-04-18T09:15:00.000Z",
    empresa: "EcoTech S.R.L.",
    plan: "Basic",
    periodo: "Abril 2026",
    monto: 99,
    moneda: "USD",
    estado: "pagado",
    metodoPago: "tarjeta",
    referencia: "SUB-APR-001",
    observacion: "Pago mensual procesado correctamente.",
  },
  {
    _id: "ING-002",
    fechaPago: "2026-04-18T11:40:00.000Z",
    empresa: "Green Systems",
    plan: "Premium",
    periodo: "Abril 2026",
    monto: 249,
    moneda: "USD",
    estado: "pagado",
    metodoPago: "transferencia",
    referencia: "SUB-APR-002",
    observacion: "Suscripción renovada automáticamente.",
  },
  {
    _id: "ING-003",
    fechaPago: "2026-04-19T08:00:00.000Z",
    empresa: "Nova Circular",
    plan: "Free",
    periodo: "Abril 2026",
    monto: 0,
    moneda: "USD",
    estado: "activo",
    metodoPago: "—",
    referencia: "SUB-APR-003",
    observacion: "Plan gratuito activo, sin cobro.",
  },
  {
    _id: "ING-004",
    fechaPago: "2026-04-19T14:25:00.000Z",
    empresa: "ReUse Bolivia",
    plan: "Basic",
    periodo: "Abril 2026",
    monto: 99,
    moneda: "USD",
    estado: "pendiente",
    metodoPago: "qr",
    referencia: "SUB-APR-004",
    observacion: "Pendiente de confirmación de pago.",
  },
  {
    _id: "ING-005",
    fechaPago: "2026-04-20T10:20:00.000Z",
    empresa: "Circular Hub",
    plan: "Premium",
    periodo: "Abril 2026",
    monto: 249,
    moneda: "USD",
    estado: "vencido",
    metodoPago: "tarjeta",
    referencia: "SUB-APR-005",
    observacion: "No se procesó la renovación del mes.",
  },
];

const fmtFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtMonto = (monto, moneda = "USD") =>
  `${moneda} ${Number(monto || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const EstadoBadge = ({ estado }) => {
  const map = {
    pagado: "success",
    pendiente: "warning",
    vencido: "danger",
    activo: "neutral",
  };

  const label = {
    pagado: "Pagado",
    pendiente: "Pendiente",
    vencido: "Vencido",
    activo: "Activo",
  };

  return (
    <span className={`${styles.estadoBadge} ${styles[`estadoBadge--${map[estado] || "default"}`]}`}>
      {label[estado] || estado}
    </span>
  );
};

const IngresosServicio = () => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPlan, setFiltroPlan] = useState("");
  const [detalle, setDetalle] = useState(null);

  const ingresosFiltrados = useMemo(() => {
    let lista = [...MOCK_INGRESOS];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (i) =>
          i._id.toLowerCase().includes(q) ||
          i.empresa.toLowerCase().includes(q) ||
          i.plan.toLowerCase().includes(q) ||
          i.referencia.toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      lista = lista.filter((i) => i.estado === filtroEstado);
    }

    if (filtroPlan) {
      lista = lista.filter((i) => i.plan === filtroPlan);
    }

    return lista;
  }, [busqueda, filtroEstado, filtroPlan]);

  const resumen = useMemo(() => {
    const total = MOCK_INGRESOS.length;
    const pagados = MOCK_INGRESOS.filter((i) => i.estado === "pagado");
    const pendientes = MOCK_INGRESOS.filter((i) => i.estado === "pendiente");
    const vencidos = MOCK_INGRESOS.filter((i) => i.estado === "vencido");

    const totalCobrado = pagados.reduce((acc, i) => acc + Number(i.monto || 0), 0);
    const totalPendiente = pendientes.reduce((acc, i) => acc + Number(i.monto || 0), 0);
    const totalVencido = vencidos.reduce((acc, i) => acc + Number(i.monto || 0), 0);

    return {
      total,
      totalCobrado,
      totalPendiente,
      totalVencido,
    };
  }, []);

  const hayFiltros = busqueda || filtroEstado || filtroPlan;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("");
    setFiltroPlan("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Mis Ingresos</h1>
          <p>Pagos recibidos por suscripciones y renovaciones de empresas del servicio.</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
          <div className={styles.statCard__icon}>
            <FiClipboard size={18} />
          </div>
          <div className={styles.statCard__value}>{resumen.total}</div>
          <div className={styles.statCard__label}>Total de movimientos</div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--paid"]}`}>
          <div className={styles.statCard__icon}>
            <FiTrendingUp size={18} />
          </div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalCobrado)}</div>
          <div className={styles.statCard__label}>Total cobrado</div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--pending"]}`}>
          <div className={styles.statCard__icon}>
            <FiCalendar size={18} />
          </div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalPendiente)}</div>
          <div className={styles.statCard__label}>Pendiente</div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--cancelled"]}`}>
          <div className={styles.statCard__icon}>
            <FiDollarSign size={18} />
          </div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalVencido)}</div>
          <div className={styles.statCard__label}>Vencido</div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FiSearch size={15} className={styles.searchWrap__icon} />
          <input
            type="text"
            placeholder="Buscar por ID, empresa, plan o referencia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className={styles.filterSelect}>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="vencido">Vencido</option>
            <option value="activo">Activo</option>
          </select>
        </div>

        <div className={styles.filterSelect}>
          <select value={filtroPlan} onChange={(e) => setFiltroPlan(e.target.value)}>
            <option value="">Todos los planes</option>
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        {hayFiltros && (
          <button className={styles.clearBtn} onClick={limpiarFiltros} type="button">
            <FiX size={13} /> Limpiar
          </button>
        )}
      </div>

      <div className={styles.tableWrap}>
        {ingresosFiltrados.length === 0 ? (
          <div className={styles.empty}>
            <FiFilter size={26} />
            <h3>Sin resultados</h3>
            <p>No se encontraron ingresos con los filtros aplicados.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Plan</th>
                <th>Período</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Método</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ingresosFiltrados.map((ingreso) => (
                <tr key={ingreso._id}>
                  <td>
                    <span className={styles.idCell}>{ingreso._id}</span>
                  </td>
                  <td>{ingreso.empresa}</td>
                  <td className={styles.planCell}>{ingreso.plan}</td>
                  <td>{ingreso.periodo}</td>
                  <td>{fmtFecha(ingreso.fechaPago)}</td>
                  <td className={styles.amountCell}>{fmtMonto(ingreso.monto, ingreso.moneda)}</td>
                  <td>
                    <EstadoBadge estado={ingreso.estado} />
                  </td>
                  <td className={styles.metodoCell}>{ingreso.metodoPago}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnView}
                      onClick={() => setDetalle(ingreso)}
                    >
                      <FiEye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detalle && (
        <div className={styles.drawerOverlay} onClick={() => setDetalle(null)}>
          <aside
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            aria-label="Detalle del ingreso"
          >
            <div className={styles.drawer__header}>
              <div>
                <p className={styles.drawer__eyebrow}>Detalle del ingreso</p>
                <h3>{detalle._id}</h3>
              </div>

              <button
                type="button"
                className={styles.drawer__close}
                onClick={() => setDetalle(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.drawer__body}>
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiCalendar size={14} /> Fecha de pago</span>
                  <strong>{fmtFecha(detalle.fechaPago)}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Estado</span>
                  <strong><EstadoBadge estado={detalle.estado} /></strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiCreditCard size={14} /> Método</span>
                  <strong>{detalle.metodoPago}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiDollarSign size={14} /> Monto</span>
                  <strong>{fmtMonto(detalle.monto, detalle.moneda)}</strong>
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiBriefcase size={14} /> Empresa</span>
                  <strong>{detalle.empresa}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiLayers size={14} /> Plan</span>
                  <strong>{detalle.plan}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiCalendar size={14} /> Período</span>
                  <strong>{detalle.periodo}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Referencia</span>
                  <strong>{detalle.referencia}</strong>
                </div>
              </div>

              <div className={styles.detailNote}>
                <p>Observación</p>
                <span>{detalle.observacion || "Sin observaciones."}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default IngresosServicio;