import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

import { fetchPagosByTenant } from "../slicesCotizaciones/CotizacionesThunk";
import {
  selectCotizaciones,
  selectPagosLoading,
  selectPagosError,
} from "../slicesCotizaciones/CotizacionesSlice";

import styles from "./GastosServicio.module.scss";

const fmtFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtMonto = (monto, moneda = "BOB") =>
  `${moneda === "BOB" ? "Bs." : moneda} ${Number(monto || 0).toLocaleString(
    "es-BO",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;

const getMontoInicial = (cot) =>
  cot?.montoInicial ?? cot?.monto_inicial ?? 0;

const getMontoFinal = (cot) =>
  cot?.montoFinal ?? cot?.monto_final ?? null;

const getMoneda = (cot) => cot?.moneda ?? "BOB";

const normalizeEstado = (estado = "") =>
  String(estado).toLowerCase().replace(/_/g, "_");

const ESTADO_MAP = {
  pagada: { mod: "success", label: "Pagada" },
  pendiente: { mod: "warning", label: "Pendiente" },
  anulado: { mod: "danger", label: "Anulado" },
  final_generada: { mod: "info", label: "Final generada" },
  preliminar_generada: { mod: "info", label: "Preliminar generada" },
  preliminar_aceptada: { mod: "warning", label: "Preliminar aceptada" },
  aprobada: { mod: "success", label: "Aprobada" },
  rechazada: { mod: "danger", label: "Rechazada" },
  finalizada: { mod: "success", label: "Finalizada" },
  final_aceptada: { mod: "success", label: "Final aceptada" },
};

const EstadoBadge = ({ estado }) => {
  const key = normalizeEstado(estado);
  const entry = ESTADO_MAP[key] ?? { mod: "default", label: estado };
  return (
    <span className={`${styles.estadoBadge} ${styles[`estadoBadge--${entry.mod}`]}`}>
      {entry.label}
    </span>
  );
};

const yaEstaPagada = (cotizacion) => {
  const estado = normalizeEstado(cotizacion?.estado);
  return estado === "pagada";
};

const puedePagar = (cotizacion) => {
  const estado = normalizeEstado(cotizacion?.estado);
  return estado === "aprobada" || estado === "final_aceptada";
};

const GastosServicio = () => {
  const dispatch = useDispatch();

  const cotizaciones = useSelector(selectCotizaciones);
  const loading = useSelector(selectPagosLoading);
  const error = useSelector(selectPagosError);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(() => {
    dispatch(fetchPagosByTenant());
  }, [dispatch]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cotizacionesFiltradas = useMemo(() => {
    let lista = [...cotizaciones];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter((c) => {
        const cliente = c.cliente || {};
        const tipo = c.tipoDispositivoId || {};
        const datosEquipo = c.datosEquipo || {};

        return (
          String(c._id || "").toLowerCase().includes(q) ||
          String(cliente.nombre || "").toLowerCase().includes(q) ||
          String(cliente.email || "").toLowerCase().includes(q) ||
          String(tipo.nombre || "").toLowerCase().includes(q) ||
          String(datosEquipo.marca || "").toLowerCase().includes(q) ||
          String(datosEquipo.modelo || "").toLowerCase().includes(q)
        );
      });
    }

    if (filtroEstado) {
      lista = lista.filter(
        (c) => normalizeEstado(c.estado) === filtroEstado
      );
    }

    return lista;
  }, [cotizaciones, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    const pagadas = cotizaciones.filter((c) => yaEstaPagada(c));
    const pendientesPago = cotizaciones.filter((c) => puedePagar(c));
    const rechazadas = cotizaciones.filter(
      (c) => normalizeEstado(c.estado) === "rechazada"
    );

    return {
      total: cotizaciones.length,
      totalPagado: pagadas.reduce(
        (acc, c) => acc + Number(getMontoFinal(c) ?? getMontoInicial(c)),
        0
      ),
      totalPendiente: pendientesPago.reduce(
        (acc, c) => acc + Number(getMontoFinal(c) ?? getMontoInicial(c)),
        0
      ),
      totalAnulado: rechazadas.reduce(
        (acc, c) => acc + Number(getMontoFinal(c) ?? getMontoInicial(c)),
        0
      ),
    };
  }, [cotizaciones]);

  const hayFiltros = busqueda || filtroEstado;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("");
  };

  const handlePagar = (cotizacion) => {
    console.log("Ir a pagar:", cotizacion);
    // aquí luego puedes navegar o abrir modal
    // navigate(`/cliente/pago/${cotizacion._id}`)
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Mis Gastos</h1>
          <p>Cotizaciones de la empresa y pagos realizados a clientes.</p>
        </div>
        <button
          type="button"
          className={styles.btnRefresh}
          onClick={cargar}
          disabled={loading}
          title="Recargar"
        >
          <FiRefreshCw size={14} className={loading ? styles.spinning : ""} />
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
          <div className={styles.statCard__icon}><FiClipboard size={18} /></div>
          <div className={styles.statCard__value}>{resumen.total}</div>
          <div className={styles.statCard__label}>Total de cotizaciones</div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--paid"]}`}>
          <div className={styles.statCard__icon}><FiDollarSign size={18} /></div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalPagado)}</div>
          <div className={styles.statCard__label}>Total pagado</div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--pending"]}`}>
          <div className={styles.statCard__icon}><FiCalendar size={18} /></div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalPendiente)}</div>
          <div className={styles.statCard__label}>Por pagar</div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--cancelled"]}`}>
          <div className={styles.statCard__icon}><FiTrendingDown size={18} /></div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalAnulado)}</div>
          <div className={styles.statCard__label}>Rechazadas</div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FiSearch size={15} className={styles.searchWrap__icon} />
          <input
            type="text"
            placeholder="Buscar por ID, cliente, dispositivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className={styles.filterSelect}>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="preliminar_generada">Preliminar generada</option>
            <option value="preliminar_aceptada">Preliminar aceptada</option>
            <option value="aprobada">Aprobada</option>
            <option value="final_aceptada">Final aceptada</option>
            <option value="pagada">Pagada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>

        {hayFiltros && (
          <button className={styles.clearBtn} onClick={limpiarFiltros} type="button">
            <FiX size={13} /> Limpiar
          </button>
        )}
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loading__spinner} />
            <p>Cargando cotizaciones...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <FiAlertCircle size={28} />
            <h3>Error al cargar</h3>
            <p>{error}</p>
            <button type="button" className={styles.btnRetry} onClick={cargar}>
              Reintentar
            </button>
          </div>
        ) : cotizacionesFiltradas.length === 0 ? (
          <div className={styles.empty}>
            <FiFilter size={26} />
            <h3>{hayFiltros ? "Sin resultados" : "Sin cotizaciones registradas"}</h3>
            <p>
              {hayFiltros
                ? "No se encontraron cotizaciones con los filtros aplicados."
                : "Aún no hay cotizaciones registradas para este tenant."}
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Dispositivo</th>
                <th>Monto inicial</th>
                <th>Monto final</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.map((cotizacion) => {
                const cliente = cotizacion.cliente || {};
                const tipo = cotizacion.tipoDispositivoId || {};
                const datosEquipo = cotizacion.datosEquipo || {};

                return (
                  <tr key={cotizacion._id}>
                    <td>
                      <span className={styles.idCell}>{cotizacion._id}</span>
                    </td>

                    <td>
                      <div>
                        <div>{cliente.nombre || "—"}</div>
                        <div className={styles.subtext}>{cliente.email || ""}</div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div>{tipo.nombre || "—"}</div>
                        <div className={styles.subtext}>
                          {[datosEquipo.marca, datosEquipo.modelo].filter(Boolean).join(" ")}
                        </div>
                      </div>
                    </td>

                    <td className={styles.amountCell}>
                      {fmtMonto(getMontoInicial(cotizacion), getMoneda(cotizacion))}
                    </td>

                    <td className={styles.amountCell}>
                      {getMontoFinal(cotizacion) != null
                        ? fmtMonto(getMontoFinal(cotizacion), getMoneda(cotizacion))
                        : <span className={styles["montoCell--null"]}>Pendiente</span>}
                    </td>

                    <td>{fmtFecha(cotizacion.updatedAt || cotizacion.createdAt)}</td>

                    <td>
                      <EstadoBadge estado={cotizacion.estado} />
                    </td>

                    <td>
                      {puedePagar(cotizacion) ? (
                        <button
                          type="button"
                          className={styles.btnPay}
                          onClick={() => handlePagar(cotizacion)}
                        >
                          <FiCreditCard size={14} />
                          Pagar
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.btnView}
                          onClick={() => setDetalle(cotizacion)}
                        >
                          <FiEye size={14} />
                          Ver detalle
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {detalle && (
        <div className={styles.drawerOverlay} onClick={() => setDetalle(null)}>
          <aside
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            aria-label="Detalle de la cotización"
          >
            <div className={styles.drawer__header}>
              <div>
                <p className={styles.drawer__eyebrow}>Detalle de cotización</p>
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
                  <strong>{fmtFecha(detalle.updatedAt || detalle.createdAt)}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Estado</span>
                  <strong><EstadoBadge estado={detalle.estado} /></strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiDollarSign size={14} /> Monto inicial</span>
                  <strong>{fmtMonto(getMontoInicial(detalle), getMoneda(detalle))}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiDollarSign size={14} /> Monto final</span>
                  <strong>
                    {getMontoFinal(detalle) != null
                      ? fmtMonto(getMontoFinal(detalle), getMoneda(detalle))
                      : "Pendiente"}
                  </strong>
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiUser size={14} /> Cliente</span>
                  <strong>{detalle.cliente?.nombre || "—"}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiUser size={14} /> Email</span>
                  <strong>{detalle.cliente?.email || "—"}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiPackage size={14} /> Tipo dispositivo</span>
                  <strong>{detalle.tipoDispositivoId?.nombre || "—"}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Modelo</span>
                  <strong>
                    {[detalle.datosEquipo?.marca, detalle.datosEquipo?.modelo]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default GastosServicio;