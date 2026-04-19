import React from "react";
import styles from "./StatusBadge.module.scss";
import { ESTADOS_SOLICITUD, ESTADOS_COTIZACION } from "../mock/data";


const StatusBadge = ({ estado, tipo = "solicitud", tooltip = true }) => {
  const mapa   = tipo === "cotizacion" ? ESTADOS_COTIZACION : ESTADOS_SOLICITUD;
  const config = mapa[estado] || { label: estado, variant: "neutral", descripcion: "", detalle: "" };

  return (
    <span className={`${styles.badge} ${styles[`badge--${config.variant}`]}`}>
      <span className={styles.badge__dot} />
      <span className={styles.badge__text}>{config.label}</span>
      {tooltip && (config.descripcion || config.detalle) && (
        <span className={styles.badge__tooltip}>
          <strong>{config.descripcion || config.label}</strong>
          {config.detalle}
        </span>
      )}
    </span>
  );
}; export default StatusBadge;