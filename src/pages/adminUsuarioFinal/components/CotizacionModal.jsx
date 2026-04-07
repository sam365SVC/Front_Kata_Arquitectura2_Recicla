import React, { useState } from "react";
import {
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiDollarSign,
} from "react-icons/fi";
import { MdOutlineDevices } from "react-icons/md";
import styles from "./CotizacionModal.module.scss";
import { CONDICIONES, TIPOS_DISPOSITIVO, cotizacionesApi } from "../mock/data";

// para consumo inicial
//sin tokens, solo para mostrar la info de la cotización y probar la UI



const CotizacionModal = ({ solicitud, onClose, onDecision }) => {
    const [step, setStep]       = useState("ver");     // "ver" | "confirmarRechazo"
    const [loading, setLoading] = useState(false);

    const cot  = solicitud?.cotizacion;
    const eq   = solicitud?.datosEquipo;
    const tipo = TIPOS_DISPOSITIVO.find((t) => t._id === solicitud?.tipoDispositivoId?._id)
                || solicitud?.tipoDispositivoId;
    const cond = CONDICIONES[eq?.condicionDeclarada] || { label: eq?.condicionDeclarada };

    if (!cot) return null;

    const handleAceptar = async () => {
        setLoading(true);
        try {
        await cotizacionesApi.aceptar(solicitud._id);
        onDecision(solicitud._id, "aceptada");
        onClose();
        } finally {
        setLoading(false);
        }
    };

    const handleRechazar = async () => {
        setLoading(true);
        try {
        await cotizacionesApi.rechazar(solicitud._id);
        onDecision(solicitud._id, "rechazada");
        onClose();
        } finally {
        setLoading(false);
        }
    };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.modal} role="dialog" aria-modal="true">

            <div className={styles.header}>
            <p className={styles.header__eyebrow}>
                <FiDollarSign size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                Oferta preliminar
            </p>
            <h2 className={styles.header__title}>Revisa tu cotización</h2>
            <p className={styles.header__sub}>
                {solicitud._id} · {eq?.marca} {eq?.modelo}
            </p>
            <button className={styles.header__close} onClick={onClose} aria-label="Cerrar">
                <FiX />
            </button>
            </div>

            <div className={styles.body}>

            {step === "ver" && (
                <>
                {/* Alerta informativa */}
                <div className={styles.alertInfo}>
                    <FiInfo size={16} />
                    <span>
                    Este es el <strong>monto estimado</strong> basado en la información que declaraste.
                    Si aceptas, coordinaremos la inspección física para confirmar el valor final.
                    </span>
                </div>

                {/* Monto hero */}
                <div className={styles.montoHero}>
                    <p className={styles.montoHero__label}>Oferta preliminar estimada</p>
                    <p className={styles.montoHero__amount}>
                    Bs. {cot.montoInicial.toLocaleString("es-BO")}
                    </p>
                    <p className={styles.montoHero__currency}>{cot.moneda}</p>
                    <span className={styles.montoHero__note}>
                    El monto final se confirma tras la inspección técnica
                    </span>
                </div>

                {/* Resumen equipo */}
                <div className={styles.equipoResumen}>
                    <p className={styles.equipoResumen__title}>
                    <MdOutlineDevices size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                    Equipo valorado
                    </p>
                    {[
                    ["Dispositivo", tipo?.nombre || "—"],
                    ["Marca / Modelo", `${eq?.marca} ${eq?.modelo}`],
                    ["Antigüedad", `${eq?.antiguedad} año${eq?.antiguedad !== 1 ? "s" : ""}`],
                    ["Condición declarada", cond?.label || "—"],
                    ].map(([k, v]) => (
                    <div key={k} className={styles.equipoResumen__row}>
                        <span>{k}</span>
                        <strong>{v}</strong>
                    </div>
                    ))}
                </div>

                {/* Reglas aplicadas */}
                {cot.reglasAplicadas?.length > 0 && (
                    <div className={styles.reglas}>
                    <p className={styles.reglas__title}>Ajustes aplicados al monto</p>
                    {cot.reglasAplicadas.map((r, i) => {
                        const esPositivo = r.valor > 0;
                        const esBase     = r.regla?.startsWith("base");
                        return (
                        <div key={i} className={styles.reglas__item}>
                            <span className={styles["reglas__item-desc"]}>{r.descripcion || r.regla}</span>
                            <span
                            className={`${styles["reglas__item-valor"]} ${
                                esBase
                                ? styles["reglas__item-valor--base"]
                                : esPositivo
                                ? styles["reglas__item-valor--positivo"]
                                : styles["reglas__item-valor--negativo"]
                            }`}
                            >
                            {esBase ? "" : esPositivo ? "+" : "−"} Bs.{" "}
                            {Math.abs(r.valor).toLocaleString("es-BO")}
                            </span>
                        </div>
                        );
                    })}
                    </div>
                )}
                </>
            )}

            {step === "confirmarRechazo" && (
                <div className={styles.rechazarConfirm}>
                <FiXCircle size={48} color="#B82020" style={{ marginBottom: 12 }} />
                <h3 className={styles.rechazarConfirm__title}>¿Rechazar la oferta?</h3>
                <p className={styles.rechazarConfirm__text}>
                    Si rechazas, la solicitud quedará marcada como <strong>no viable</strong> y
                    no podrás retomar este proceso. Podrás crear una nueva solicitud en el futuro.
                </p>
                <div className={styles.rechazarConfirm__actions}>
                    <button
                    className={styles.footer__btnRechazar}
                    onClick={handleRechazar}
                    disabled={loading}
                    >
                    {loading ? (
                        <span className={styles.footer__spinner} />
                    ) : (
                        <FiXCircle size={16} />
                    )}
                    Sí, rechazar
                    </button>
                    <button
                    className={styles.footer__btnAceptar}
                    onClick={() => setStep("ver")}
                    disabled={loading}
                    >
                    Volver
                    </button>
                </div>
                </div>
            )}
            </div>

            {step === "ver" && (
            <div className={styles.footer}>
                <button
                className={styles.footer__btnRechazar}
                onClick={() => setStep("confirmarRechazo")}
                disabled={loading}
                >
                <FiXCircle size={15} />
                Rechazar oferta
                </button>
                <button
                className={styles.footer__btnAceptar}
                onClick={handleAceptar}
                disabled={loading}
                >
                {loading ? (
                    <span className={styles.footer__spinner} />
                ) : (
                    <FiCheckCircle size={16} />
                )}
                Aceptar oferta
                </button>
            </div>
            )}
        </div>
    </div>
  );
}; export default CotizacionModal;