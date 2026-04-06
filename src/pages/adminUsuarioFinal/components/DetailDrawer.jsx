import React from "react";
import { FiX, FiSmartphone, FiTool, FiDollarSign, FiWifi } from "react-icons/fi";
import { MdOutlineDevices, MdOutlineHistory } from "react-icons/md";
import styles from "./DetailDrawer.module.scss";
import StatusBadge from "./StatusBadge";
import {
  ESTADOS_SOLICITUD,
  CONDICIONES,
  TIPOS_DISPOSITIVO,
} from "../mock/data";

// Pasos del flujo para el timeline
const FLUJO = [
  { key: "creada",               label: "Solicitud creada",        icon: FiSmartphone },
  { key: "preliminar_generada",  label: "Oferta preliminar",       icon: FiDollarSign },
  { key: "preliminar_aceptada",  label: "Oferta aceptada",         icon: FiDollarSign },
  { key: "en_inspeccion",        label: "Inspección técnica",      icon: FiTool       },
  { key: "aprobada",             label: "Cotización aprobada",     icon: FiDollarSign },
  { key: "pagada",               label: "Pago realizado",          icon: FiDollarSign },
];

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-BO", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const DetailDrawer = ({ solicitud, onClose }) => {
  if (!solicitud) return null;

  const cfg   = ESTADOS_SOLICITUD[solicitud.estado] || {};
  const eq    = solicitud.datosEquipo;
  const tipo  = solicitud.tipoDispositivoId;
  const cond  = CONDICIONES[eq?.condicionDeclarada];
  const pasoActual = cfg.paso || 1;
  const esRechazada = solicitud.estado === "rechazada";

  return (
    <>
        <div className={styles.overlay} onClick={onClose} />

        <aside className={styles.drawer} aria-label="Detalle de solicitud">

            <div className={styles.header}>
            <div className={styles.header__top}>
                <div>
                <p className={styles.header__eyebrow}>
                    <MdOutlineDevices size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                    Detalle de solicitud
                </p>
                <h2 className={styles.header__id}>{solicitud._id}</h2>
                <p className={styles.header__date}>Creada el {fmt(solicitud.createdAt)}</p>
                </div>
                <button className={styles.header__close} onClick={onClose} aria-label="Cerrar">
                <FiX />
                </button>
            </div>

            <StatusBadge estado={solicitud.estado} tooltip={false} />
            <p className={styles.header__desc}>
                {cfg.descripcion} — {cfg.detalle}
            </p>
            </div>

            <div className={styles.body}>

            {/* Timeline */}
            <div className={styles.section}>
                <p className={styles.section__title}>
                <MdOutlineHistory size={14} />
                Estado del proceso
                </p>
                <div className={styles.timeline}>
                {FLUJO.map((f, i) => {
                    const Icon     = f.icon;
                    const esCurr   = f.key === solicitud.estado;
                    const esDone   = i < pasoActual - 1;
                    const esDanger = esRechazada && esCurr;

                    return (
                    <div key={f.key} className={styles.timeline__item}>
                        <div
                        className={`${styles.timeline__circle} ${
                            esDanger
                            ? styles["timeline__circle--danger"]
                            : esCurr
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
                        {esCurr && !esDanger && (
                        <span className={styles.timeline__pill}>Actual</span>
                        )}
                    </div>
                    );
                })}
                </div>
            </div>

            {/* Monto si existe */}
            {solicitud.montoInicial != null && (
                <div className={styles.montoCard}>
                <p>Monto estimado</p>
                <strong>Bs. {solicitud.montoInicial.toLocaleString("es-BO")}</strong>
                <span>{solicitud.moneda}</span>
                </div>
            )}

            {/* Datos del equipo */}
            <div className={styles.section}>
                <p className={styles.section__title}>
                <MdOutlineDevices size={14} />
                Datos del equipo
                </p>
                <div className={styles.infoBox}>
                {[
                    ["Tipo",       tipo?.nombre || "—"],
                    ["Marca",      eq?.marca],
                    ["Modelo",     eq?.modelo],
                    ["Antigüedad", `${eq?.antiguedad} año${eq?.antiguedad !== 1 ? "s" : ""}`],
                    ["Condición",  cond?.label || eq?.condicionDeclarada],
                    ...(eq?.descripcion ? [["Descripción", eq.descripcion]] : []),
                ].map(([k, v]) => (
                    <div key={k} className={styles.infoBox__row}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                    </div>
                ))}
                </div>
            </div>

            {/* Reglas aplicadas */}
            {solicitud.reglasAplicadas?.length > 0 && (
                <div className={styles.section}>
                <p className={styles.section__title}>
                    <FiDollarSign size={14} />
                    Ajustes aplicados
                </p>
                <div className={styles.infoBox}>
                    {solicitud.reglasAplicadas.map((r, i) => (
                    <div key={i} className={styles.reglaRow}>
                        <span>{r.descripcion || r.codigo}</span>
                        <strong style={{ color: r.ajusteMonto < 0 ? "#FC6441" : "#1A7A56" }}>
                        {r.ajusteMonto >= 0 ? "+" : "−"} Bs. {Math.abs(r.ajusteMonto).toLocaleString("es-BO")}
                        </strong>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* Canal */}
            <div className={styles.canalBadge}>
                <FiWifi size={13} />
                Solicitud enviada por canal <strong style={{ marginLeft: 4 }}>{solicitud.canal}</strong>
            </div>
            </div>
        </aside>
    </>
  );
};

export default DetailDrawer;