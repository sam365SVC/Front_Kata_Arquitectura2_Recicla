import React, { useMemo, useState } from "react";
import {
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiX,
  FiEye,
  FiTrendingDown,
  FiCalendar,
  FiClipboard,
  FiCreditCard,
  FiUser,
  FiPackage,
} from "react-icons/fi";
import styles from "./PagosEmpresa.module.scss";

const MOCK_GASTOS = [
  {
    _id: "GST-001",
    fecha: "2026-04-18T10:30:00.000Z",
    empresa: "EcoTech S.R.L.",
    cliente: "Juan Pérez",
    dispositivo: "Samsung A24",
    tipoDispositivo: "Smartphone",
    montoPagado: 850,
    moneda: "BOB",
    estado: "pagado",
    metodoPago: "transferencia",
    observacion: "Pago completado luego de inspección aprobada",
  },
  {
    _id: "GST-002",
    fecha: "2026-04-18T15:10:00.000Z",
    empresa: "Green Systems",
    cliente: "María López",
    dispositivo: "HP Pavilion 15",
    tipoDispositivo: "Laptop",
    montoPagado: 1450,
    moneda: "BOB",
    estado: "pagado",
    metodoPago: "qr",
    observacion: "Pago confirmado al cliente por recompra",
  },
  {
    _id: "GST-003",
    fecha: "2026-04-19T09:20:00.000Z",
    empresa: "ReUse Bolivia",
    cliente: "Carlos Fernández",
    dispositivo: "LG Smart TV 43",
    tipoDispositivo: "Televisor",
    montoPagado: 1200,
    moneda: "BOB",
    estado: "pendiente",
    metodoPago: "transferencia",
    observacion: "Pendiente de confirmación bancaria",
  },
  {
    _id: "GST-004",
    fecha: "2026-04-19T13:45:00.000Z",
    empresa: "EcoTech S.R.L.",
    cliente: "Ana Rojas",
    dispositivo: "iPhone 12",
    tipoDispositivo: "Smartphone",
    montoPagado: 2100,
    moneda: "BOB",
    estado: "pagado",
    metodoPago: "tarjeta",
    observacion: "Proceso concluido exitosamente",
  },
  {
    _id: "GST-005",
    fecha: "2026-04-20T08:15:00.000Z",
    empresa: "Nova Circular",
    cliente: "Luis Vargas",
    dispositivo: "Lenovo Ideapad 3",
    tipoDispositivo: "Laptop",
    montoPagado: 980,
    moneda: "BOB",
    estado: "anulado",
    metodoPago: "efectivo",
    observacion: "Operación anulada por inconsistencias",
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

const fmtMonto = (monto, moneda = "BOB") =>
  `${moneda === "BOB" ? "Bs." : moneda} ${Number(monto || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const EstadoBadge = ({ estado }) => {
  const map = {
    pagado: "success",
    pendiente: "warning",
    anulado: "danger",
  };

  const label = {
    pagado: "Pagado",
    pendiente: "Pendiente",
    anulado: "Anulado",
  };

  return (
    <span className={`${styles.estadoBadge} ${styles[`estadoBadge--${map[estado] || "default"}`]}`}>
      {label[estado] || estado}
    </span>
  );
};

const PagosEmpresa = () => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [detalle, setDetalle] = useState(null);

  const gastosFiltrados = useMemo(() => {
    let lista = [...MOCK_GASTOS];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (g) =>
          g._id.toLowerCase().includes(q) ||
          g.empresa.toLowerCase().includes(q) ||
          g.cliente.toLowerCase().includes(q) ||
          g.dispositivo.toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      lista = lista.filter((g) => g.estado === filtroEstado);
    }

    if (filtroMetodo) {
      lista = lista.filter((g) => g.metodoPago === filtroMetodo);
    }

    return lista;
  }, [busqueda, filtroEstado, filtroMetodo]);

  const resumen = useMemo(() => {
    const total = MOCK_GASTOS.length;
    const pagados = MOCK_GASTOS.filter((g) => g.estado === "pagado");
    const pendientes = MOCK_GASTOS.filter((g) => g.estado === "pendiente");
    const anulados = MOCK_GASTOS.filter((g) => g.estado === "anulado");

    const totalPagado = pagados.reduce((acc, g) => acc + Number(g.montoPagado || 0), 0);
    const totalPendiente = pendientes.reduce((acc, g) => acc + Number(g.montoPagado || 0), 0);
    const totalAnulado = anulados.reduce((acc, g) => acc + Number(g.montoPagado || 0), 0);

    return {
      total,
      totalPagado,
      totalPendiente,
      totalAnulado,
    };
  }, []);

  const hayFiltros = busqueda || filtroEstado || filtroMetodo;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("");
    setFiltroMetodo("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Mis Gastos</h1>
          <p>Pagos realizados a clientes por dispositivos recepcionados y procesados.</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
          <div className={styles.statCard__icon}>
            <FiClipboard size={18} />
          </div>
          <div className={styles.statCard__value}>{resumen.total}</div>
          <div className={styles.statCard__label}>Total de egresos</div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--paid"]}`}>
          <div className={styles.statCard__icon}>
            <FiDollarSign size={18} />
          </div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalPagado)}</div>
          <div className={styles.statCard__label}>Total pagado</div>
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
            <FiTrendingDown size={18} />
          </div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalAnulado)}</div>
          <div className={styles.statCard__label}>Anulado</div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FiSearch size={15} className={styles.searchWrap__icon} />
          <input
            type="text"
            placeholder="Buscar por ID, empresa, cliente o dispositivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className={styles.filterSelect}>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>

        <div className={styles.filterSelect}>
          <select value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)}>
            <option value="">Todos los métodos</option>
            <option value="transferencia">Transferencia</option>
            <option value="qr">QR</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>

        {hayFiltros && (
          <button className={styles.clearBtn} onClick={limpiarFiltros} type="button">
            <FiX size={13} /> Limpiar
          </button>
        )}
      </div>

      <div className={styles.tableWrap}>
        {gastosFiltrados.length === 0 ? (
          <div className={styles.empty}>
            <FiFilter size={26} />
            <h3>Sin resultados</h3>
            <p>No se encontraron gastos con los filtros aplicados.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Cliente</th>
                <th>Dispositivo</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Método</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map((gasto) => (
                <tr key={gasto._id}>
                  <td>
                    <span className={styles.idCell}>{gasto._id}</span>
                  </td>
                  <td>{gasto.empresa}</td>
                  <td>{gasto.cliente}</td>
                  <td>{gasto.dispositivo}</td>
                  <td>{fmtFecha(gasto.fecha)}</td>
                  <td className={styles.amountCell}>{fmtMonto(gasto.montoPagado, gasto.moneda)}</td>
                  <td>
                    <EstadoBadge estado={gasto.estado} />
                  </td>
                  <td className={styles.metodoCell}>{gasto.metodoPago}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnView}
                      onClick={() => setDetalle(gasto)}
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
            aria-label="Detalle del gasto"
          >
            <div className={styles.drawer__header}>
              <div>
                <p className={styles.drawer__eyebrow}>Detalle de gasto</p>
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
                  <span><FiCalendar size={14} /> Fecha</span>
                  <strong>{fmtFecha(detalle.fecha)}</strong>
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
                  <span><FiDollarSign size={14} /> Monto pagado</span>
                  <strong>{fmtMonto(detalle.montoPagado, detalle.moneda)}</strong>
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiPackage size={14} /> Dispositivo</span>
                  <strong>{detalle.dispositivo}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiPackage size={14} /> Tipo</span>
                  <strong>{detalle.tipoDispositivo}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiUser size={14} /> Cliente</span>
                  <strong>{detalle.cliente}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Empresa</span>
                  <strong>{detalle.empresa}</strong>
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

export default PagosEmpresa;