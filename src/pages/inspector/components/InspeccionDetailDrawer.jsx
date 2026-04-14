import React from "react";
import {
  FiX,
  FiTool,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
  FiUser,
  FiClipboard,
} from "react-icons/fi";
import { MdOutlineDevices, MdOutlineHistory } from "react-icons/md";
import styles from "./DetailDrawer.module.scss";
import StatusBadge from "./StatusBadge";

const CONDICIONES = {
  excelente: { label: "Excelente" },
  bueno: { label: "Bueno" },
  regular: { label: "Regular" },
  malo: { label: "Malo" },
};

const FLUJO_INSPECCION = [
  { key: "pendiente", label: "Pendiente", icon: FiClock },
  { key: "en_proceso", label: "En proceso", icon: FiTool },
  { key: "completada", label: "Completada", icon: FiCheckCircle },
];

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const DetailDrawer = ({ inspeccion, onClose }) => {
  if (!inspeccion) return null;

  const solicitud = inspeccion.solicitudCotizacionId || {};
  const eq = solicitud.datosEquipo || {};
  const tipo = solicitud.tipoDispositivoId || {};
  const cliente = solicitud.cliente || {};
  const condDeclarada =
    CONDICIONES[eq?.condicionDeclarada]?.label || eq?.condicionDeclarada || "—";
  const condReal =
    CONDICIONES[inspeccion?.condicionReal]?.label ||
    inspeccion?.condicionReal ||
    "—";

  const pasoActual =
    FLUJO_INSPECCION.findIndex((f) => f.key === inspeccion.estado) + 1 || 1;

  const checklist = inspeccion.checklistInspeccion || [];

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <aside className={styles.drawer} aria-label="Detalle de inspección">
        <div className={styles.header}>
          <div className={styles.header__top}>
            <div>
              <p className={styles.header__eyebrow}>
                <FiTool
                  size={11}
                  style={{ marginRight: 4, verticalAlign: "middle" }}
                />
                Detalle de inspección
              </p>
              <h2 className={styles.header__id}>{inspeccion._id}</h2>
              <p className={styles.header__date}>
                Registrada el {fmt(inspeccion.createdAt)}
              </p>
            </div>

            <button
              className={styles.header__close}
              onClick={onClose}
              aria-label="Cerrar"
            >
              <FiX />
            </button>
          </div>

          <StatusBadge estado={inspeccion.estado} tooltip={false} />

          <p className={styles.header__desc}>
            <strong>Inspección técnica</strong> — revisión del equipo{" "}
            <strong>
              {eq?.marca} {eq?.modelo}
            </strong>{" "}
            asociada a la solicitud <strong>{solicitud._id}</strong>.
          </p>
        </div>

        <div className={styles.body}>
          {/* Timeline */}
          <div className={styles.section}>
            <p className={styles.section__title}>
              <MdOutlineHistory size={14} />
              Estado de la inspección
            </p>

            <div className={styles.timeline}>
              {FLUJO_INSPECCION.map((f, i) => {
                const Icon = f.icon;
                const esCurr = f.key === inspeccion.estado;
                const esDone = i < pasoActual - 1;

                return (
                  <div key={f.key} className={styles.timeline__item}>
                    <div
                      className={`${styles.timeline__circle} ${
                        esCurr
                          ? styles["timeline__circle--current"]
                          : esDone
                          ? styles["timeline__circle--done"]
                          : ""
                      }`}
                    >
                      <Icon size={14} />
                    </div>

                    <span
                      className={`${styles.timeline__label} ${
                        esCurr
                          ? styles["timeline__label--current"]
                          : esDone
                          ? styles["timeline__label--done"]
                          : ""
                      }`}
                    >
                      {f.label}
                    </span>

                    {esCurr && (
                      <span className={styles.timeline__pill}>Actual</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <div className={styles.section}>
            <p className={styles.section__title}>
              <FiClipboard size={14} />
              Resumen de inspección
            </p>

            <div className={styles.infoBox}>
              {[
                ["Solicitud relacionada", solicitud._id || "—"],
                ["Inspector", inspeccion.inspector?.nombre || "—"],
                ["Usuario inspector", inspeccion.inspector?.usuarioId || "—"],
                ["Fecha de inspección", fmt(inspeccion.createdAt)],
                ["Estado", inspeccion.estado || "—"],
              ].map(([k, v]) => (
                <div key={k} className={styles.infoBox__row}>
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Datos del equipo */}
          <div className={styles.section}>
            <p className={styles.section__title}>
              <MdOutlineDevices size={14} />
              Datos del equipo
            </p>

            <div className={styles.infoBox}>
              {[
                ["Tipo", tipo?.nombre || "—"],
                ["Marca", eq?.marca || "—"],
                ["Modelo", eq?.modelo || "—"],
                [
                  "Antigüedad",
                  eq?.antiguedad != null
                    ? `${eq.antiguedad} año${eq.antiguedad !== 1 ? "s" : ""}`
                    : "—",
                ],
                ["Cliente", cliente?.nombre || "—"],
                ["Condición declarada", condDeclarada],
                ["Condición real", condReal],
                ...(eq?.descripcion ? [["Descripción", eq.descripcion]] : []),
              ].map(([k, v]) => (
                <div key={k} className={styles.infoBox__row}>
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Ajuste */}
          <div className={styles.section}>
            <p className={styles.section__title}>
              <FiDollarSign size={14} />
              Resultado económico
            </p>

            <div className={styles.infoBox}>
              {[
                [
                  "Monto preliminar",
                  solicitud.montoInicial != null
                    ? `Bs. ${Number(solicitud.montoInicial).toLocaleString("es-BO")}`
                    : "—",
                ],
                [
                  "¿Requiere ajuste?",
                  inspeccion.requiereAjusteCotizacion ? "Sí" : "No",
                ],
                [
                  "Monto sugerido",
                  inspeccion.montoSugerido != null
                    ? `Bs. ${Number(inspeccion.montoSugerido).toLocaleString("es-BO")}`
                    : "—",
                ],
              ].map(([k, v]) => (
                <div key={k} className={styles.infoBox__row}>
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          {checklist.length > 0 && (
            <div className={styles.section}>
              <p className={styles.section__title}>
                <FiClipboard size={14} />
                Checklist de inspección
              </p>

              <div className={styles.infoBox}>
                {checklist.map((item, i) => (
                  <div key={`${item.codigo}-${i}`} className={styles.reglaRow}>
                    <span>
                      {item.descripcion}
                      {item.obligatorio && (
                        <strong style={{ marginLeft: 6 }}> *</strong>
                      )}
                    </span>
                    <strong>{item.codigo}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default DetailDrawer;