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
  FiCpu,
  FiMonitor,
  FiSmartphone,
  FiCalendar,
  FiHash,
} from "react-icons/fi";
import { MdOutlineDevices, MdOutlineHistory } from "react-icons/md";
import styles from "./DetailDrawer.module.scss";
import StatusBadge from "./StatusBadge";

const CONDICIONES = {
  excelente: { label: "Excelente" },
  bueno:     { label: "Bueno" },
  regular:   { label: "Regular" },
  malo:      { label: "Malo" },
};

const FLUJO_INSPECCION = [
  { key: "pendiente",  label: "Pendiente",  icon: FiClock        },
  { key: "en_proceso", label: "En proceso", icon: FiTool         },
  { key: "completada", label: "Completada", icon: FiCheckCircle  },
];

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-BO", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const fmtShort = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-BO", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

const DeviceIcon = ({ nombre }) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("celular") || n.includes("phone") || n.includes("móvil"))
    return <FiSmartphone size={26} />;
  if (n.includes("laptop") || n.includes("notebook") || n.includes("pc"))
    return <FiMonitor size={26} />;
  return <FiCpu size={26} />;
};

const InfoRow = ({ label, value, highlight }) => (
  <div className={`${styles.infoRow} ${highlight ? styles["infoRow--highlight"] : ""}`}>
    <span className={styles.infoRow__label}>{label}</span>
    <strong className={styles.infoRow__value}>{value}</strong>
  </div>
);

const SectionCard = ({ icon: Icon, title, accent, children }) => (
  <div className={`${styles.sectionCard} ${accent ? styles[`sectionCard--${accent}`] : ""}`}>
    <div className={styles.sectionCard__header}>
      <span className={styles.sectionCard__icon}><Icon size={14} /></span>
      <span className={styles.sectionCard__title}>{title}</span>
    </div>
    <div className={styles.sectionCard__body}>{children}</div>
  </div>
);

const DetailDrawer = ({ inspeccion, onClose }) => {
  if (!inspeccion) return null;

  const solicitud    = inspeccion.solicitudCotizacionId || {};
  const eq           = solicitud.datosEquipo || {};
  const tipo         = solicitud.tipoDispositivoId || {};
  const cliente      = solicitud.cliente || {};
  const condDeclarada =
    CONDICIONES[eq?.condicionDeclarada]?.label || eq?.condicionDeclarada || "—";
  const condReal =
    CONDICIONES[inspeccion?.condicionReal]?.label || inspeccion?.condicionReal || "—";

  const pasoActual =
    FLUJO_INSPECCION.findIndex((f) => f.key === inspeccion.estado) + 1 || 1;

  const checklist = inspeccion.checklistInspeccion || [];

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <aside className={styles.drawer} aria-label="Detalle de inspección">

        {/* ── Banner header ── */}
        <div className={styles.banner}>
          <button className={styles.banner__close} onClick={onClose} aria-label="Cerrar">
            <FiX size={18} />
          </button>

          <div className={styles.banner__device}>
            <div className={styles.banner__deviceIcon}>
              <DeviceIcon nombre={tipo?.nombre} />
            </div>
            <div className={styles.banner__deviceInfo}>
              <span className={styles.banner__deviceType}>{tipo?.nombre || "Dispositivo"}</span>
              <span className={styles.banner__deviceModel}>
                {[eq?.marca, eq?.modelo].filter(Boolean).join(" ") || "—"}
              </span>
            </div>
          </div>

          <div className={styles.banner__meta}>
            <span className={styles.banner__id}>
              <FiHash size={11} style={{ marginRight: 3 }} />
              {inspeccion._id}
            </span>
            <StatusBadge estado={inspeccion.estado} />
          </div>

          <div className={styles.banner__client}>
            <FiUser size={12} style={{ marginRight: 5 }} />
            {cliente?.nombre || "—"}
            <span className={styles.banner__sep}>·</span>
            <FiCalendar size={12} style={{ marginRight: 5 }} />
            {fmtShort(inspeccion.createdAt)}
          </div>
        </div>

        {/* ── Cuerpo scrollable ── */}
        <div className={styles.body}>

          {/* Timeline horizontal */}
          <div className={styles.timeline}>
            {FLUJO_INSPECCION.map((f, i) => {
              const Icon   = f.icon;
              const esDone = i < pasoActual - 1;
              const esCurr = f.key === inspeccion.estado;

              return (
                <React.Fragment key={f.key}>
                  <div className={styles.timeline__step}>
                    <div
                      className={`${styles.timeline__node}
                        ${esDone ? styles["timeline__node--done"]    : ""}
                        ${esCurr ? styles["timeline__node--current"] : ""}
                      `}
                    >
                      <Icon size={14} />
                    </div>
                    <span
                      className={`${styles.timeline__label}
                        ${esDone ? styles["timeline__label--done"]    : ""}
                        ${esCurr ? styles["timeline__label--current"] : ""}
                      `}
                    >
                      {f.label}
                    </span>
                    {esCurr && <span className={styles.timeline__pill}>Actual</span>}
                  </div>

                  {i < FLUJO_INSPECCION.length - 1 && (
                    <div className={`${styles.timeline__line} ${esDone ? styles["timeline__line--done"] : ""}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Resumen de inspección */}
          <SectionCard icon={FiClipboard} title="Resumen de inspección" accent="primary">
            <InfoRow label="Solicitud relacionada" value={solicitud._id || "—"} />
            <InfoRow label="Inspector"             value={inspeccion.inspector?.nombre || "—"} />
            <InfoRow label="Usuario inspector"     value={inspeccion.inspector?.usuarioId || "—"} />
            <InfoRow label="Fecha de inspección"   value={fmt(inspeccion.createdAt)} />
            <InfoRow label="Estado"                value={inspeccion.estado || "—"} />
          </SectionCard>

          {/* Datos del equipo */}
          <SectionCard icon={MdOutlineDevices} title="Datos del equipo" accent="device">
            <InfoRow label="Tipo"                value={tipo?.nombre || "—"} />
            <InfoRow label="Marca"               value={eq?.marca || "—"} />
            <InfoRow label="Modelo"              value={eq?.modelo || "—"} />
            <InfoRow
              label="Antigüedad"
              value={
                eq?.antiguedad != null
                  ? `${eq.antiguedad} año${eq.antiguedad !== 1 ? "s" : ""}`
                  : "—"
              }
            />
            <InfoRow label="Cliente"             value={cliente?.nombre || "—"} />
            <InfoRow label="Condición declarada" value={condDeclarada} />
            <InfoRow label="Condición real"      value={condReal} highlight />
            {eq?.descripcion && (
              <InfoRow label="Descripción" value={eq.descripcion} />
            )}
          </SectionCard>

          {/* Resultado económico */}
          <SectionCard icon={FiDollarSign} title="Resultado económico" accent="money">
            <InfoRow
              label="Monto preliminar"
              value={
                solicitud.montoInicial != null
                  ? `Bs. ${Number(solicitud.montoInicial).toLocaleString("es-BO")}`
                  : "—"
              }
            />
            <InfoRow
              label="¿Requiere ajuste?"
              value={inspeccion.requiereAjusteCotizacion ? "Sí" : "No"}
            />
            <InfoRow
              label="Monto sugerido"
              value={
                inspeccion.montoSugerido != null
                  ? `Bs. ${Number(inspeccion.montoSugerido).toLocaleString("es-BO")}`
                  : "—"
              }
              highlight
            />
          </SectionCard>

          {/* Checklist */}
          {checklist.length > 0 && (
            <SectionCard icon={FiClipboard} title="Checklist de inspección" accent="check">
              {checklist.map((item, i) => (
                <div key={`${item.codigo}-${i}`} className={styles.checkRow}>
                  <div className={styles.checkRow__left}>
                    <span className={styles.checkRow__desc}>
                      {item.descripcion}
                    </span>
                    {item.obligatorio && (
                      <span className={styles.checkRow__badge}>Obligatorio</span>
                    )}
                  </div>
                  <span className={styles.checkRow__code}>{item.codigo}</span>
                </div>
              ))}
            </SectionCard>
          )}

        </div>
      </aside>
    </>
  );
};

export default DetailDrawer;