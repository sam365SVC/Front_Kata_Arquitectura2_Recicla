import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiSearch,
  FiX,
  FiEye,
  FiTool,
  FiClipboard,
  FiClock,
  FiCheckSquare,
  FiAlertOctagon,
  FiAlertCircle,
  FiInbox,
} from "react-icons/fi";
import styles from "./MisInspecciones.module.scss";
import StatusBadge from "./StatusBadge";
import InspeccionDetailDrawer from "./InspeccionDetailDrawer";
import InspeccionModal from "./InspeccionModal";
import { ESTADOS_INSPECCION } from "../mock/data";
import { useDispatch, useSelector } from "react-redux";
import { fetchInspeccionesByInspectorId } from "../slicesInspecciones/InspeccionesThunk";
import {
  selectInspecciones,
  selectInspeccionesLoading,
} from "../slicesInspecciones/InspeccionesSlice";

const fmtFecha = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const ESTADOS_LISTA = Object.entries(ESTADOS_INSPECCION).map(([k, v]) => ({
  value: k,
  label: v.label,
}));

const Toast = ({ msg, tipo }) => (
  <div className={`${styles.toast} ${styles[`toast--${tipo}`]}`}>
    {tipo === "success" ? (
      <FiCheckSquare size={16} />
    ) : (
      <FiAlertOctagon size={16} />
    )}
    {msg}
  </div>
);

const MisInspecciones = () => {
  const dispatch = useDispatch();

  const inspecciones = useSelector(selectInspecciones) || [];
  const loading = useSelector(selectInspeccionesLoading);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const [inspeccionModal, setInspeccionModal] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [toast, setToast] = useState(null);

  const cargar = useCallback(() => {
    dispatch(
      fetchInspeccionesByInspectorId({
        tenantId: 1,
        inspectorId: "INSP-2024-0001",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const showToast = (msg, tipo = "success") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3600);
  };

  const filtradas = useMemo(() => {
    let lista = [...inspecciones];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();

      lista = lista.filter((insp) => {
        const solicitud = insp.solicitudCotizacionId || {};
        const datosEquipo = solicitud.datosEquipo || {};
        const cliente = solicitud.cliente || {};
        const tipoDispositivo = solicitud.tipoDispositivoId || {};

        return (
          insp._id?.toLowerCase().includes(q) ||
          datosEquipo.marca?.toLowerCase().includes(q) ||
          datosEquipo.modelo?.toLowerCase().includes(q) ||
          cliente.nombre?.toLowerCase().includes(q) ||
          tipoDispositivo.nombre?.toLowerCase().includes(q)
        );
      });
    }

    if (filtroEstado) {
      lista = lista.filter((insp) => insp.estado === filtroEstado);
    }

    if (filtroFecha) {
      const ahora = new Date();

      lista = lista.filter((insp) => {
        const d = new Date(insp.createdAt);

        if (filtroFecha === "hoy") {
          return d.toDateString() === ahora.toDateString();
        }

        if (filtroFecha === "semana") {
          const h = new Date();
          h.setDate(ahora.getDate() - 7);
          return d >= h;
        }

        if (filtroFecha === "mes") {
          return (
            d.getMonth() === ahora.getMonth() &&
            d.getFullYear() === ahora.getFullYear()
          );
        }

        return true;
      });
    }

    return lista;
  }, [inspecciones, busqueda, filtroEstado, filtroFecha]);

  const stats = useMemo(
    () => ({
      total: inspecciones.length,
      pendientes: inspecciones.filter((s) => s.estado === "pendiente").length,
      enProceso: inspecciones.filter((s) => s.estado === "en_proceso").length,
      completadas: inspecciones.filter((s) => s.estado === "completada").length,
    }),
    [inspecciones]
  );

  const handleIniciarInspeccion = () => {
    setInspeccionModal(null);
    cargar();
    showToast("Inspección iniciada correctamente.", "success");
  };

  const handleCompletarInspeccion = () => {
    setDetalle(null);
    cargar();
    showToast("Inspección marcada como completada.", "success");
  };

  const limpiar = () => {
    setBusqueda("");
    setFiltroEstado("");
    setFiltroFecha("");
  };

  const hayFiltros = busqueda || filtroEstado || filtroFecha;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeading}>
          <h1>Mis Inspecciones</h1>
          <p>Inspecciones técnicas asignadas a tu usuario</p>
        </div>
      </div>

      <div className={styles.stats}>
        {[
          {
            key: "total",
            mod: "total",
            label: "Total asignadas",
            icon: FiClipboard,
            num: stats.total,
          },
          {
            key: "pendientes",
            mod: "activas",
            label: "Pendientes",
            icon: FiClock,
            num: stats.pendientes,
          },
          {
            key: "enProceso",
            mod: "aprobadas",
            label: "En proceso",
            icon: FiAlertCircle,
            num: stats.enProceso,
          },
          {
            key: "completadas",
            mod: "rechazadas",
            label: "Completadas",
            icon: FiCheckSquare,
            num: stats.completadas,
          },
        ].map(({ key, mod, label, icon: Icon, num }) => (
          <div
            key={key}
            className={`${styles.statCard} ${styles[`statCard--${mod}`]}`}
          >
            <div className={styles.statCard__icon}>
              <Icon size={18} />
            </div>
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
            placeholder="Buscar por ID, marca, modelo o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className={styles.filterSelect}>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_LISTA.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterSelect}>
          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          >
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
            <p>Cargando tus inspecciones...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.empty__icon}>
              <FiInbox size={28} />
            </div>
            <h3>{hayFiltros ? "Sin resultados" : "No tienes inspecciones asignadas"}</h3>
            <p>
              {hayFiltros
                ? "Intenta ajustar los filtros o la búsqueda."
                : "Cuando se te asigne una inspección, aparecerá aquí."}
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Dispositivo</th>
                <th>Cliente</th>
                <th>Fecha de inspección</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((insp) => {
                const solicitud = insp.solicitudCotizacionId || {};
                const datosEquipo = solicitud.datosEquipo || {};
                const cliente = solicitud.cliente || {};
                const tipoDispositivo = solicitud.tipoDispositivoId || {};

                const puedeIniciar = insp.estado === "pendiente";
                const enCurso = insp.estado === "en_proceso";

                return (
                  <tr key={insp._id} onClick={() => setDetalle(insp)}>
                    <td>
                      <span className={styles.idCell}>{insp._id}</span>
                    </td>

                    <td>
                      <div className={styles.equipoCell}>
                        <div className={styles.equipoCell__marca}>
                          {tipoDispositivo?.nombre || "—"}
                        </div>
                        <div className={styles.equipoCell__modelo}>
                          {datosEquipo?.marca || "—"} {datosEquipo?.modelo || ""}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={styles.clienteCell}>
                        {cliente?.nombre || "—"}
                      </span>
                    </td>

                    <td>
                      <span className={styles.dateCell}>
                        {fmtFecha(insp.createdAt)}
                      </span>
                    </td>

                    <td>
                      <StatusBadge estado={insp.estado} />
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actionsCell}>
                        {puedeIniciar && (
                          <button
                            className={styles.btnOferta}
                            onClick={() => setInspeccionModal(insp)}
                            title="Iniciar inspección"
                          >
                            <FiTool size={13} /> Iniciar
                          </button>
                        )}

                        {enCurso && (
                          <button
                            className={styles.btnOferta}
                            onClick={() => setDetalle(insp)}
                            title="Continuar inspección"
                          >
                            <FiTool size={13} /> Continuar
                          </button>
                        )}

                        <button
                          className={styles.btnView}
                          onClick={() => setDetalle(insp)}
                          title="Ver detalle"
                        >
                          <FiEye size={13} /> Detalle
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
          Mostrando {filtradas.length} de {inspecciones.length} inspecciones
        </p>
      )}

      {inspeccionModal && (
        <InspeccionModal
          inspeccion={inspeccionModal}
          onClose={() => setInspeccionModal(null)}
          onSuccess={handleIniciarInspeccion}
        />
      )}

      {detalle && (
        <InspeccionDetailDrawer
          inspeccion={detalle}
          onClose={() => setDetalle(null)}
          onCompletar={handleCompletarInspeccion}
        />
      )}

      {toast && <Toast msg={toast.msg} tipo={toast.tipo} />}
    </div>
  );
};

export default MisInspecciones;