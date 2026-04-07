import React, { useMemo, useState } from "react";
import {
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiDollarSign,
} from "react-icons/fi";
import { MdOutlineDevices } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import styles from "./CotizacionModal.module.scss";
import {
  aceptarCotizacionInicial,
  rechazarCotizacionInicial,
} from "../slicesCotizaciones/CotizacionesThunk";
import {
  selectCotizacionesLoading,
} from "../slicesCotizaciones/CotizacionesSlice";
import { selectTiposDispositivo } from "../slicesTiposDispositivo/TiposDispositivoSlice";

const CONDICIONES = {
  excelente: { label: "Excelente" },
  bueno: { label: "Bueno" },
  regular: { label: "Regular" },
  malo: { label: "Malo" },
};

const CotizacionModal = ({ solicitud, onClose, onDecision }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("ver");

  const loading = useSelector(selectCotizacionesLoading);
  const tiposDispositivo = useSelector(selectTiposDispositivo) || [];

  const eq = solicitud?.datosEquipo;

  const tipo = useMemo(() => {
    const tipoId =
      typeof solicitud?.tipoDispositivoId === "object"
        ? solicitud?.tipoDispositivoId?._id
        : solicitud?.tipoDispositivoId;

    return tiposDispositivo.find((t) => t._id === tipoId) || solicitud?.tipoDispositivoId;
  }, [tiposDispositivo, solicitud]);

  const cond = CONDICIONES[eq?.condicionDeclarada] || {
    label: eq?.condicionDeclarada || "—",
  };

  if (!solicitud) return null;

  const handleAceptar = async () => {
    const resultAction = await dispatch(
      aceptarCotizacionInicial({
        solicitudId: solicitud._id,
        usuario: "cliente",
      })
    );

    if (aceptarCotizacionInicial.fulfilled.match(resultAction)) {
      onDecision?.(solicitud._id, "aceptada", resultAction.payload);
      onClose?.();
    }
  };

  const handleRechazar = async () => {
    const resultAction = await dispatch(
      rechazarCotizacionInicial({
        solicitudId: solicitud._id,
        estado: "rechazada",
      })
    );

    if (rechazarCotizacionInicial.fulfilled.match(resultAction)) {
      onDecision?.(solicitud._id, "rechazada", resultAction.payload);
      onClose?.();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <p className={styles.header__eyebrow}>
            <FiDollarSign
              size={11}
              style={{ marginRight: 4, verticalAlign: "middle" }}
            />
            Oferta preliminar
          </p>
          <h2 className={styles.header__title}>Revisa tu cotización</h2>
          <p className={styles.header__sub}>
            {solicitud._id} · {eq?.marca} {eq?.modelo}
          </p>
          <button
            className={styles.header__close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <FiX />
          </button>
        </div>

        <div className={styles.body}>
          {step === "ver" && (
            <>
              <div className={styles.alertInfo}>
                <FiInfo size={16} />
                <span>
                  Este es el <strong>monto estimado</strong> basado en la información que declaraste.
                  Si aceptas, coordinaremos la inspección física para confirmar el valor final.
                </span>
              </div>

              <div className={styles.montoHero}>
                <p className={styles.montoHero__label}>Oferta preliminar estimada</p>
                <p className={styles.montoHero__amount}>
                  Bs. {Number(solicitud.montoInicial || 0).toLocaleString("es-BO")}
                </p>
                <p className={styles.montoHero__currency}>
                  {solicitud.moneda || "BOB"}
                </p>
                <span className={styles.montoHero__note}>
                  El monto final se confirma tras la inspección técnica
                </span>
              </div>

              <div className={styles.equipoResumen}>
                <p className={styles.equipoResumen__title}>
                  <MdOutlineDevices
                    size={13}
                    style={{ marginRight: 5, verticalAlign: "middle" }}
                  />
                  Equipo valorado
                </p>

                {[
                  ["Dispositivo", tipo?.nombre || "—"],
                  ["Marca / Modelo", `${eq?.marca || ""} ${eq?.modelo || ""}`.trim() || "—"],
                  [
                    "Antigüedad",
                    `${eq?.antiguedad ?? 0} año${eq?.antiguedad !== 1 ? "s" : ""}`,
                  ],
                  ["Condición declarada", cond?.label || "—"],
                ].map(([k, v]) => (
                  <div key={k} className={styles.equipoResumen__row}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>

              {solicitud.reglasAplicadas?.length > 0 && (
                <div className={styles.reglas}>
                  <p className={styles.reglas__title}>Ajustes aplicados al monto</p>

                  {solicitud.reglasAplicadas.map((r, i) => {
                    const valor = Number(r.ajusteMonto || 0);
                    const esPositivo = valor > 0;

                    return (
                      <div key={i} className={styles.reglas__item}>
                        <span className={styles["reglas__item-desc"]}>
                          {r.descripcion || r.codigo}
                        </span>
                        <span
                          className={`${styles["reglas__item-valor"]} ${
                            esPositivo
                              ? styles["reglas__item-valor--positivo"]
                              : styles["reglas__item-valor--negativo"]
                          }`}
                        >
                          {esPositivo ? "+" : "−"} Bs.{" "}
                          {Math.abs(valor).toLocaleString("es-BO")}
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
};

export default CotizacionModal;