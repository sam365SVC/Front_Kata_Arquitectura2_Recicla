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

import { fetchPagosByTenant } from "../slicesCotizaciones/CotizacionesThunk"; // ajusta ruta
import {
  selectCotizaciones,
  selectPagosLoading,
  selectPagosError,
} from "../slicesCotizaciones/CotizacionesSlice"; // ajusta ruta

import styles from "./PagosEmpresa.module.scss";

// ─── Utils ────────────────────────────────────────────────────────────────────

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

// ─── Normaliza el campo monto desde la estructura real de la API ──────────────
// La API devuelve montoFinal y montoInicial; usamos montoFinal si existe.
const getMonto = (pago) =>
  pago.montoFinal ?? pago.monto_final ?? pago.montoInicial ?? pago.monto_inicial ?? 0;

const getMoneda = (pago) => pago.moneda ?? "BOB";

// Normaliza el estado al formato del badge (minúsculas)
const normalizeEstado = (estado = "") => estado.toLowerCase().replace(/_/g, "_");

// ─── Badge de estado ──────────────────────────────────────────────────────────

const ESTADO_MAP = {
  // estados del pago en sí
  pagado:           { mod: "success", label: "Pagado" },
  pendiente:        { mod: "warning", label: "Pendiente" },
  anulado:          { mod: "danger",  label: "Anulado"  },
  // estados de la cotización que aún no son pago
  final_generada:   { mod: "info",    label: "Final generada" },
  preliminar_generada: { mod: "info", label: "Preliminar generada" },
  preliminar_aceptada: { mod: "warning", label: "Preliminar aceptada" },
  aprobada:         { mod: "success", label: "Aprobada" },
  rechazada:        { mod: "danger",  label: "Rechazada" },
  finalizada:       { mod: "success", label: "Finalizada" },
};

const EstadoBadge = ({ estado }) => {
  const key   = normalizeEstado(estado);
  const entry = ESTADO_MAP[key] ?? { mod: "default", label: estado };
  return (
    <span className={`${styles.estadoBadge} ${styles[`estadoBadge--${entry.mod}`]}`}>
      {entry.label}
    </span>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const PagosEmpresa = () => {
  const dispatch = useDispatch();

  const pagos = useSelector(selectCotizaciones);
  console.log("pagos desde selector", pagos);
  const cotizaciones = useSelector(selectCotizaciones);
  console.log("cotizaciones desde selector", cotizaciones);
  const loading = useSelector(selectPagosLoading);
  const error   = useSelector(selectPagosError);

  const [busqueda,    setBusqueda]    = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [detalle,     setDetalle]     = useState(null);

  const cargar = useCallback(() => {
    console.log("cargar ");
    dispatch(fetchPagosByTenant());
  }, [dispatch]);

  useEffect(() => { cargar(); }, [cargar]);

  // ─── Filtrado ───────────────────────────────────────────────────────────────
  const pagosFiltrados = useMemo(() => {
    let lista = [...pagos];

    console.log("lista",lista);
    return lista;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (p) =>
          (p._id ?? "").toLowerCase().includes(q) ||
          (p.solicitudCotizacionId ?? p.solicitud_cotizacion_id ?? "").toLowerCase().includes(q) ||
          (p.clienteNombre ?? p.cliente_nombre ?? "").toLowerCase().includes(q) ||
          (p.clienteEmail ?? p.cliente_email ?? "").toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      lista = lista.filter(
        (p) => normalizeEstado(p.estado) === filtroEstado
      );
    }

    if (filtroMetodo) {
      const m = filtroMetodo.toUpperCase();
      lista = lista.filter(
        (p) => (p.metodoPago ?? p.metodo_pago ?? "").toUpperCase() === m
      );
    }
  }, [pagos, busqueda, filtroEstado, filtroMetodo]);

  // ─── Resumen ────────────────────────────────────────────────────────────────
  const resumen = useMemo(() => {
    const pagados   = pagos.filter((p) => normalizeEstado(p.estado) === "pagado");
    const pendientes = pagos.filter((p) => normalizeEstado(p.estado) === "pendiente");
    const anulados   = pagos.filter((p) => normalizeEstado(p.estado) === "anulado");

    return {
      total:         pagos.length,
      totalPagado:   pagados.reduce((acc, p) => acc + Number(getMonto(p)), 0),
      totalPendiente:pendientes.reduce((acc, p) => acc + Number(getMonto(p)), 0),
      totalAnulado:  anulados.reduce((acc, p) => acc + Number(getMonto(p)), 0),
    };
  }, [pagos]);

  const hayFiltros = busqueda || filtroEstado || filtroMetodo;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("");
    setFiltroMetodo("");
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Mis Gastos</h1>
          <p>Pagos realizados a clientes por dispositivos recepcionados y procesados.</p>
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

      {/* ── Stats ── */}
      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
          <div className={styles.statCard__icon}><FiClipboard size={18} /></div>
          <div className={styles.statCard__value}>{resumen.total}</div>
          <div className={styles.statCard__label}>Total de egresos</div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--paid"]}`}>
          <div className={styles.statCard__icon}><FiDollarSign size={18} /></div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalPagado)}</div>
          <div className={styles.statCard__label}>Total pagado</div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--pending"]}`}>
          <div className={styles.statCard__icon}><FiCalendar size={18} /></div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalPendiente)}</div>
          <div className={styles.statCard__label}>Pendiente</div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--cancelled"]}`}>
          <div className={styles.statCard__icon}><FiTrendingDown size={18} /></div>
          <div className={styles.statCard__value}>{fmtMonto(resumen.totalAnulado)}</div>
          <div className={styles.statCard__label}>Anulado</div>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FiSearch size={15} className={styles.searchWrap__icon} />
          <input
            type="text"
            placeholder="Buscar por ID, solicitud, cliente o email..."
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
            <option value="final_generada">Final generada</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>

        <div className={styles.filterSelect}>
          <select value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)}>
            <option value="">Todos los métodos</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="QR">QR</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="EFECTIVO">Efectivo</option>
          </select>
        </div>

        {hayFiltros && (
          <button className={styles.clearBtn} onClick={limpiarFiltros} type="button">
            <FiX size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loading__spinner} />
            <p>Cargando pagos...</p>
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
        ) : pagosFiltrados.length === 0 ? (
          <div className={styles.empty}>
            <FiFilter size={26} />
            <h3>{hayFiltros ? "Sin resultados" : "Sin pagos registrados"}</h3>
            <p>
              {hayFiltros
                ? "No se encontraron pagos con los filtros aplicados."
                : "Aún no hay pagos registrados para este tenant."}
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Solicitud</th>
                <th>Cliente</th>
                <th>Monto inicial</th>
                <th>Monto final</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Método</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => (
                <tr key={pago._id}>
                  <td>
                    <span className={styles.idCell}>{pago._id}</span>
                  </td>
                  <td>
                    <span className={styles.idCell}>
                      {pago.solicitudCotizacionId ?? pago.solicitud_cotizacion_id ?? "—"}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div>{pago.clienteNombre ?? pago.cliente_nombre ?? "—"}</div>
                      <div className={styles.subtext}>
                        {pago.clienteEmail ?? pago.cliente_email ?? ""}
                      </div>
                    </div>
                  </td>
                  <td className={styles.amountCell}>
                    {fmtMonto(pago.montoInicial ?? pago.monto_inicial, getMoneda(pago))}
                  </td>
                  <td className={styles.amountCell}>
                    {pago.montoFinal ?? pago.monto_final
                      ? fmtMonto(pago.montoFinal ?? pago.monto_final, getMoneda(pago))
                      : <span className={styles["montoCell--null"]}>Pendiente</span>}
                  </td>
                  <td>{fmtFecha(pago.createdAt ?? pago.fecha)}</td>
                  <td>
                    <EstadoBadge estado={pago.estado} />
                  </td>
                  <td className={styles.metodoCell}>
                    {pago.metodoPago ?? pago.metodo_pago ?? "—"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnView}
                      onClick={() => setDetalle(pago)}
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

      {/* ── Drawer detalle ── */}
      {detalle && (
        <div className={styles.drawerOverlay} onClick={() => setDetalle(null)}>
          <aside
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            aria-label="Detalle del pago"
          >
            <div className={styles.drawer__header}>
              <div>
                <p className={styles.drawer__eyebrow}>Detalle de pago</p>
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
              {/* Bloque financiero */}
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiCalendar size={14} /> Fecha</span>
                  <strong>{fmtFecha(detalle.createdAt ?? detalle.fecha)}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Estado</span>
                  <strong><EstadoBadge estado={detalle.estado} /></strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiCreditCard size={14} /> Método</span>
                  <strong>{detalle.metodoPago ?? detalle.metodo_pago ?? "—"}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiDollarSign size={14} /> Monto inicial</span>
                  <strong>
                    {fmtMonto(detalle.montoInicial ?? detalle.monto_inicial, getMoneda(detalle))}
                  </strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiDollarSign size={14} /> Monto final</span>
                  <strong>
                    {detalle.montoFinal ?? detalle.monto_final
                      ? fmtMonto(detalle.montoFinal ?? detalle.monto_final, getMoneda(detalle))
                      : "Pendiente"}
                  </strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Moneda</span>
                  <strong>{getMoneda(detalle)}</strong>
                </div>
              </div>

              {/* Bloque cliente / cotización */}
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiUser size={14} /> Cliente</span>
                  <strong>{detalle.clienteNombre ?? detalle.cliente_nombre ?? "—"}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiUser size={14} /> Email</span>
                  <strong>{detalle.clienteEmail ?? detalle.cliente_email ?? "—"}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiPackage size={14} /> Tipo dispositivo</span>
                  <strong>{detalle.tipoDispositivoId ?? detalle.tipo_dispositivo_id ?? "—"}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> ID solicitud</span>
                  <strong>
                    {detalle.solicitudCotizacionId ?? detalle.solicitud_cotizacion_id ?? "—"}
                  </strong>
                </div>
              </div>

              {/* Aceptación */}
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span>¿Aceptó preliminar?</span>
                  <strong>
                    {detalle.clienteAceptoPreliminar != null
                      ? detalle.clienteAceptoPreliminar ? "Sí" : "No"
                      : "—"}
                  </strong>
                </div>
                {detalle.fechaAceptacionPreliminar && (
                  <div className={styles.detailRow}>
                    <span>Fecha aceptación preliminar</span>
                    <strong>{fmtFecha(detalle.fechaAceptacionPreliminar)}</strong>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span>¿Aceptó final?</span>
                  <strong>
                    {detalle.clienteAceptoFinal != null
                      ? detalle.clienteAceptoFinal ? "Sí" : "No"
                      : "—"}
                  </strong>
                </div>
                {detalle.fechaAceptacionFinal && (
                  <div className={styles.detailRow}>
                    <span>Fecha aceptación final</span>
                    <strong>{fmtFecha(detalle.fechaAceptacionFinal)}</strong>
                  </div>
                )}
              </div>

              {/* Motivo ajuste / observación */}
              {(detalle.motivoAjuste || detalle.motivo_ajuste) && (
                <div className={styles.detailNote}>
                  <p>Motivo de ajuste</p>
                  <span>{detalle.motivoAjuste ?? detalle.motivo_ajuste}</span>
                </div>
              )}

              {/* Reglas aplicadas si las hay */}
              {Array.isArray(detalle.reglasAplicadas) && detalle.reglasAplicadas.length > 0 && (
                <div className={styles.detailNote}>
                  <p>Reglas aplicadas</p>
                  <ul>
                    {detalle.reglasAplicadas.map((r, i) => (
                      <li key={i}>{typeof r === "string" ? r : JSON.stringify(r)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default PagosEmpresa;
