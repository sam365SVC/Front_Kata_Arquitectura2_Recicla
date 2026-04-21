import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import { fetchSuscripciones } from "../slicesIngresos/IngresosThunk";
import {
  selectSuscripciones,
  selectSuscripcionesLoading,
  selectSuscripcionesError,
} from "../slicesIngresos/IngresosSlices";

import styles from "./IngresosServicio.module.scss";

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

const EstadoBadge = ({ estado }) => {
  const estadoNormalizado = String(estado || "").toLowerCase();

  const map = {
    pagado: "success",
    pendiente: "warning",
    vencido: "danger",
    activo: "neutral",
    confirmado: "success",
  };

  const label = {
    pagado: "Pagado",
    pendiente: "Pendiente",
    vencido: "Vencido",
    activo: "Activo",
    confirmado: "Confirmado",
  };

  return (
    <span
      className={`${styles.estadoBadge} ${
        styles[`estadoBadge--${map[estadoNormalizado] || "default"}`]
      }`}
    >
      {label[estadoNormalizado] || estado}
    </span>
  );
};

const IngresosServicio = () => {
  const dispatch = useDispatch();

  const suscripciones = useSelector(selectSuscripciones);
  const loading = useSelector(selectSuscripcionesLoading);
  const error = useSelector(selectSuscripcionesError);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPlan, setFiltroPlan] = useState("");
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(() => {
    dispatch(fetchSuscripciones());
  }, [dispatch]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ingresosFiltrados = useMemo(() => {
    let lista = [...suscripciones];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (i) =>
          String(i.id_suscripcion_pago || "").toLowerCase().includes(q) ||
          String(i.nombre_plan || "").toLowerCase().includes(q) ||
          String(i.estado || "").toLowerCase().includes(q) ||
          String(i.tenant_id || "").toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      lista = lista.filter(
        (i) => String(i.estado || "").toLowerCase() === filtroEstado
      );
    }

    if (filtroPlan) {
      lista = lista.filter((i) => i.nombre_plan === filtroPlan);
    }

    return lista;
  }, [suscripciones, busqueda, filtroEstado, filtroPlan]);

  const resumen = useMemo(() => {
    const total = suscripciones.length;
    const pagados = suscripciones.filter(
      (i) => String(i.estado || "").toUpperCase() === "PAGADO"
    );
    const pendientes = suscripciones.filter(
      (i) => String(i.estado || "").toUpperCase() === "PENDIENTE"
    );
    const vencidos = suscripciones.filter(
      (i) => String(i.estado || "").toUpperCase() === "VENCIDO"
    );

    const totalCobrado = pagados.reduce(
      (acc, i) => acc + Number(i.total || 0),
      0
    );
    const totalPendiente = pendientes.reduce(
      (acc, i) => acc + Number(i.total || 0),
      0
    );
    const totalVencido = vencidos.reduce(
      (acc, i) => acc + Number(i.total || 0),
      0
    );

    return {
      total,
      totalCobrado,
      totalPendiente,
      totalVencido,
    };
  }, [suscripciones]);

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

        <button
          type="button"
          className={styles.btnRefresh}
          onClick={cargar}
          disabled={loading}
        >
          <FiRefreshCw size={14} className={loading ? styles.spinning : ""} />
          {loading ? "Cargando..." : "Actualizar"}
        </button>
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
            placeholder="Buscar por ID, plan, estado o tenant..."
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
            <option value="Freemium">Freemium</option>
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
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
          <div className={styles.empty}>
            <FiFilter size={26} />
            <h3>Cargando ingresos...</h3>
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <FiAlertCircle size={26} />
            <h3>Error al cargar</h3>
            <p>{error}</p>
          </div>
        ) : ingresosFiltrados.length === 0 ? (
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
                <th>Tenant</th>
                <th>Plan</th>
                <th>Meses</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ingresosFiltrados.map((ingreso) => (
                <tr key={ingreso.id_suscripcion_pago}>
                  <td>
                    <span className={styles.idCell}>
                      {ingreso.id_suscripcion_pago}
                    </span>
                  </td>
                  <td>{ingreso.tenant_id}</td>
                  <td className={styles.planCell}>{ingreso.nombre_plan}</td>
                  <td>{ingreso.meses}</td>
                  <td>{fmtFecha(ingreso.fecha_inicio)}</td>
                  <td>{fmtFecha(ingreso.fecha_fin)}</td>
                  <td className={styles.amountCell}>
                    {fmtMonto(ingreso.total, ingreso.moneda)}
                  </td>
                  <td>
                    <EstadoBadge estado={ingreso.estado} />
                  </td>
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
                <h3>{detalle.id_suscripcion_pago}</h3>
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
                  <span><FiCalendar size={14} /> Fecha de creación</span>
                  <strong>{fmtFecha(detalle.creado_en)}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Estado</span>
                  <strong><EstadoBadge estado={detalle.estado} /></strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiDollarSign size={14} /> Precio unitario</span>
                  <strong>{fmtMonto(detalle.precio_unitario, detalle.moneda)}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiDollarSign size={14} /> Total</span>
                  <strong>{fmtMonto(detalle.total, detalle.moneda)}</strong>
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiBriefcase size={14} /> Tenant</span>
                  <strong>{detalle.tenant_id}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiLayers size={14} /> Plan</span>
                  <strong>{detalle.nombre_plan}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiCalendar size={14} /> Fecha inicio</span>
                  <strong>{fmtFecha(detalle.fecha_inicio)}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiCalendar size={14} /> Fecha fin</span>
                  <strong>{fmtFecha(detalle.fecha_fin)}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiCreditCard size={14} /> Meses</span>
                  <strong>{detalle.meses}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default IngresosServicio;