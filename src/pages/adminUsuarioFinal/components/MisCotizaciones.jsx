import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiPlus, FiSearch, FiFilter, FiX,
  FiEye, FiDollarSign, FiInbox,
  FiClipboard, FiClock, FiCheckSquare, FiAlertOctagon,
} from "react-icons/fi";
import { MdOutlineDevices } from "react-icons/md";
import styles from "./MisCotizaciones.module.scss";
import StatusBadge from "./StatusBadge";
import CreateSolicitudModal from "./CreateSolicitudModal";
import CotizacionModal from "./CotizacionModal";
import DetailDrawer from "./DetailDrawer";
import { ESTADOS_SOLICITUD, solicitudesApi } from "../mock/data";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCotizacionesByClienteId,
} from "../slicesCotizaciones/CotizacionesThunk";
import {
  selectCotizaciones,
  selectCotizacionesLoading,
} from "../slicesCotizaciones/CotizacionesSlice";

import { selectTenantId, selectUser } from "../../signin/slices/loginSelectors";

const fmtFecha = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-BO", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

const ESTADOS_LISTA = Object.entries(ESTADOS_SOLICITUD).map(([k, v]) => ({
  value: k, label: v.label,
}));

const Toast = ({ msg, tipo }) => (
  <div className={`${styles.toast} ${styles[`toast--${tipo}`]}`}>
    {tipo === "success" ? <FiCheckSquare size={16} /> : <FiAlertOctagon size={16} />}
    {msg}
  </div>
);

const MisCotizaciones = () => {
    const dispatch = useDispatch();

    const solicitudes = useSelector(selectCotizaciones) || [];
    console.log("Solicitudes desde store:", solicitudes);
    const loading = useSelector(selectCotizacionesLoading);

    const [busqueda,     setBusqueda]     = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFecha,  setFiltroFecha]  = useState("");

    const [modalNueva, setModalNueva]   = useState(false);
    const [cotModal,   setCotModal]     = useState(null);   // solicitud con cotizacion
    const [detalle,    setDetalle]      = useState(null);   // solicitud para drawer

    const [toast, setToast] = useState(null);
    //datos necesarios para creacion de solicitud
      const tenantId = useSelector(selectTenantId);
      const user = useSelector(selectUser);

    // Carga 
    const cargar = useCallback(() => {
    dispatch(fetchCotizacionesByClienteId({ tenantId: tenantId, clienteId: user?.id }));
    }, [dispatch, tenantId, user?.id]);

    useEffect(() => { cargar(); }, [cargar]);

    // Toast
    const showToast = (msg, tipo = "success") => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 3600);
    };

    // Filtros 
    const filtradas = useMemo(() => {
        let lista = [...solicitudes];
        if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        lista = lista.filter(
            (s) =>
            s._id.toLowerCase().includes(q) ||
            s.datosEquipo.marca.toLowerCase().includes(q) ||
            s.datosEquipo.modelo.toLowerCase().includes(q),
        );
        }
        if (filtroEstado) lista = lista.filter((s) => s.estado === filtroEstado);
        if (filtroFecha) {
        const ahora = new Date();
        lista = lista.filter((s) => {
            const d = new Date(s.createdAt);
            if (filtroFecha === "hoy")    return d.toDateString() === ahora.toDateString();
            if (filtroFecha === "semana") { const h = new Date(); h.setDate(ahora.getDate() - 7); return d >= h; }
            if (filtroFecha === "mes")    return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
            return true;
        });
        }
        return lista;
    }, [solicitudes, busqueda, filtroEstado, filtroFecha]);

    // Stats 
    const stats = useMemo(() => {
        const activas    = ["creada","preliminar_generada","preliminar_aceptada","pendiente_inspeccion","en_inspeccion","ajustada"];
        const aprobadas  = ["aprobada","pagada","finalizada"];
        return {
        total:     solicitudes.length,
        activas:   solicitudes.filter((s) => activas.includes(s.estado)).length,
        aprobadas: solicitudes.filter((s) => aprobadas.includes(s.estado)).length,
        rechazadas:solicitudes.filter((s) => s.estado === "rechazada").length,
        };
    }, [solicitudes]);

    const handleNueva = (nueva) => {
        setModalNueva(false);
        cargar();
        showToast(`Solicitud ${nueva._id} creada exitosamente`);
    };

    const handleDecisionCotizacion = (solicitudId, decision) => {
    cargar();
    if (decision === "aceptada") {
        showToast("Oferta aceptada. Coordinaremos la inspección técnica.", "success");
    } else {
        showToast("Oferta rechazada. Puedes crear una nueva solicitud cuando quieras.", "info");
    }
    };

    const limpiar = () => { setBusqueda(""); setFiltroEstado(""); setFiltroFecha(""); };
    const hayFiltros = busqueda || filtroEstado || filtroFecha;

  return (
    <div className={styles.page}>

        {/* Page header */}
        <div className={styles.pageHeader}>
            <div className={styles.pageHeading}>
            <h1>Mis Cotizaciones</h1>
            <p>Gestiona tus solicitudes de valoración de dispositivos</p>
            </div>
            <button className={styles.btnNew} onClick={() => setModalNueva(true)}>
            <FiPlus size={16} />
            Nueva Solicitud
            </button>
        </div>

        <div className={styles.stats}>
            {[
            { key: "total",      mod: "total",      label: "Total", icon: FiClipboard,    num: stats.total     },
            { key: "activas",    mod: "activas",     label: "En proceso", icon: FiClock,  num: stats.activas   },
            { key: "aprobadas",  mod: "aprobadas",   label: "Aprobadas",  icon: FiCheckSquare, num: stats.aprobadas },
            { key: "rechazadas", mod: "rechazadas",  label: "No viables", icon: FiAlertOctagon, num: stats.rechazadas },
            ].map(({ key, mod, label, icon: Icon, num }) => (
            <div key={key} className={`${styles.statCard} ${styles[`statCard--${mod}`]}`}>
                <div className={styles.statCard__icon}><Icon size={18} /></div>
                <div className={styles.statCard__num}>{num}</div>
                <div className={styles.statCard__label}>{label}</div>
            </div>
            ))}
        </div>

        <div className={styles.filters}>
            <div className={styles.searchWrap}>
            <FiSearch size={15} className={styles.searchWrap__icon} />
            <input
                type="text"
                placeholder="Buscar por ID, marca o modelo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />
            </div>

            <div className={styles.filterSelect}>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                {ESTADOS_LISTA.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
                ))}
            </select>
            </div>

            <div className={styles.filterSelect}>
            <select value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}>
                <option value="">Cualquier fecha</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Última semana</option>
                <option value="mes">Este mes</option>
            </select>
            </div>

            {hayFiltros && (
            <button className={styles.clearBtn} onClick={limpiar}>
                <FiX size={13} /> Limpiar
            </button>
            )}
        </div>

        <div className={styles.tableWrap}>
            {loading ? (
            <div className={styles.loading}>
                <div className={styles.loading__spinner} />
                <p>Cargando tus solicitudes...</p>
            </div>
            ) : filtradas.length === 0 ? (
            <div className={styles.empty}>
                <div className={styles.empty__icon}>
                <FiInbox size={28} />
                </div>
                <h3>{hayFiltros ? "Sin resultados" : "Aún no tienes solicitudes"}</h3>
                <p>
                {hayFiltros
                    ? "Intenta ajustar los filtros o la búsqueda."
                    : "Haz clic en 'Nueva Solicitud' para comenzar tu primera valoración."}
                </p>
            </div>
            ) : (
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Dispositivo</th>
                    <th>Antigüedad</th>
                    <th>Monto estimado</th>
                    <th>Estado</th>
                    <th>Creada</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {filtradas.map((sol) => {
                    const tieneCotizacion = sol.estado === "preliminar_generada" || sol.estado === "preliminar_aceptada";
                    return (
                    <tr key={sol._id} onClick={() => setDetalle(sol)}>
                        <td><span className={styles.idCell}>{sol._id}</span></td>
                        <td>
                        <div className={styles.equipoCell}>
                            <div className={styles.equipoCell__marca}>{sol.datosEquipo.marca}</div>
                            <div className={styles.equipoCell__modelo}>{sol.datosEquipo.modelo}</div>
                        </div>
                        </td>
                        <td>
                        {sol.datosEquipo.antiguedad} año{sol.datosEquipo.antiguedad !== 1 ? "s" : ""}
                        </td>
                        <td>
                        {sol.cotizacion?.montoInicial != null || sol.montoInicial != null ? (
                            <span className={styles.montoCell}>
                            Bs. {(sol.cotizacion?.montoInicial ?? sol.montoInicial).toLocaleString("es-BO")}
                            </span>
                        ) : (
                            <span className={styles["montoCell--null"]}>Pendiente</span>
                        )}
                        </td>
                        <td>
                        <StatusBadge estado={sol.estado} />
                        </td>
                        <td><span className={styles.dateCell}>{fmtFecha(sol.createdAt)}</span></td>
                        <td onClick={(e) => e.stopPropagation()}>
                        <div className={styles.actionsCell}>
                            {/* Botón oferta si está disponible */}
                            {tieneCotizacion && (
                            <button
                                className={styles.btnOferta}
                                onClick={() => setCotModal(sol)}
                                title="Ver oferta preliminar"
                            >
                                <FiDollarSign size={13} />
                                Ver oferta
                            </button>
                            )}
                            <button
                            className={styles.btnView}
                            onClick={() => setDetalle(sol)}
                            title="Ver detalle"
                            >
                            <FiEye size={13} />
                            Detalle
                            </button>
                        </div>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            )}
        </div>

        {!loading && filtradas.length > 0 && (
            <p className={styles.resultCount}>
            Mostrando {filtradas.length} de {solicitudes.length} solicitudes
            </p>
        )}

        {modalNueva && (
            <CreateSolicitudModal
            onClose={() => setModalNueva(false)}
            onSuccess={handleNueva}
            />
        )}

        {cotModal && (
            <CotizacionModal
            solicitud={cotModal}
            onClose={() => setCotModal(null)}
            onDecision={handleDecisionCotizacion}
            />
        )}

        {detalle && (
            <DetailDrawer
            solicitud={detalle}
            onClose={() => setDetalle(null)}
            />
        )}

        {/* Toast */}
        {toast && <Toast msg={toast.msg} tipo={toast.tipo} />}
        </div>
    );
}; export default MisCotizaciones;