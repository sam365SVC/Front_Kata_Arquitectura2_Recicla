import React, { useState, useMemo, useEffect } from "react";
import {
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiClipboard,
  FiTool,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiAlertTriangle,
  FiInfo,
  FiCamera
} from "react-icons/fi";
import { MdOutlineDevices } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import styles from "./InspeccionModal.module.scss";
import { completarInspeccion } from "../slicesInspecciones/InspeccionesThunk";
import { selectInspeccionesLoading } from "../slicesInspecciones/InspeccionesSlice";
import { selectTiposDispositivo } from "../slicesTiposDispositivo/TiposDispositivoSlice";

const CONDICIONES = {
  excelente: { label: "Excelente" },
  bueno: { label: "Bueno" },
  regular: { label: "Regular" },
  malo: { label: "Malo" },
};

const STEPS = ["checklist", "condicion", "confirmar"];

const InspeccionModal = ({ inspeccion, onClose, onSuccess }) => {
  const [fotoActiva, setFotoActiva] = useState(null);
  const dispatch = useDispatch();
  const loading = useSelector(selectInspeccionesLoading);
  const tiposDispositivo = useSelector(selectTiposDispositivo) || [];

  const solicitud = inspeccion?.solicitudCotizacionId || {};
  console.log("Solicitud de la inspección:", solicitud);
  const eq = solicitud?.datosEquipo || {};
  const fotos = eq?.fotos || [];

  const tipo = useMemo(() => {
    const tipoId =
      typeof solicitud?.tipoDispositivoId === "object"
        ? solicitud?.tipoDispositivoId?._id
        : solicitud?.tipoDispositivoId;

    return (
      tiposDispositivo.find((t) => t._id === tipoId) ||
      solicitud?.tipoDispositivoId ||
      null
    );
  }, [tiposDispositivo, solicitud]);

  const checklistItems = useMemo(() => {
    return tipo?.checklistInspeccion || [];
  }, [tipo]);

  const [step, setStep] = useState("checklist");
  const [checkResults, setCheckResults] = useState({});
  const [condicionReal, setCondicionReal] = useState("");
  const [requiereAjuste, setRequiereAjuste] = useState(null);
  const [montoSugerido, setMontoSugerido] = useState("");

  useEffect(() => {
    if (checklistItems.length > 0) {
      const initial = Object.fromEntries(
        checklistItems.map((item) => [item.codigo, null])
      );
      setCheckResults(initial);
    }
  }, [checklistItems]);

  if (!inspeccion) return null;

  const toggleItem = (codigo, value) => {
    setCheckResults((prev) => ({
      ...prev,
      [codigo]: value,
    }));
  };

  const totalChecklist = checklistItems.length;
  const completadosChecklist = Object.values(checkResults).filter(
    (v) => v !== null
  ).length;
  const aprobadosChecklist = Object.values(checkResults).filter(
    (v) => v === true
  ).length;
  const observadosChecklist = Object.values(checkResults).filter(
    (v) => v === false
  ).length;

  const checklistCompleto =
    totalChecklist > 0 &&
    Object.values(checkResults).every((v) => v !== null);

  const obligatoriosPendientes = checklistItems.filter(
    (item) => item.obligatorio && checkResults[item.codigo] === null
  );

  const condicionOk = !!condicionReal;

  const ajusteOk =
    requiereAjuste !== null &&
    (!requiereAjuste ||
      (montoSugerido !== "" && Number(montoSugerido) > 0));

  const stepIdx = STEPS.indexOf(step);

  const handleSubmit = async () => {
  const data = {
    tenantId: inspeccion.tenantId ?? 1,
    solicitudCotizacionId: solicitud._id,
    inspector: {
      usuarioId: inspeccion.inspector?.usuarioId,
      nombre: inspeccion.inspector?.nombre,
    },
    checklistResultados: Object.entries(checkResults).map(
      ([codigo, resultado]) => ({
        codigo,
        resultado,
      })
    ),
    condicionReal,
    requiereAjusteCotizacion: requiereAjuste,
    ...(requiereAjuste && {
      montoSugerido: Number(montoSugerido),
    }),
    estado: "completada",
  };

  const idInspeccion = inspeccion._id;

  const resultAction = await dispatch(
    completarInspeccion({
      idInspeccion,
      data,
    })
  );

  console.log("Result action:", resultAction);

  if (completarInspeccion.fulfilled.match(resultAction)) {
    onSuccess?.();
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
            <FiTool size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
            Inspección técnica
          </p>

          <h2 className={styles.header__title}>Registrar inspección</h2>

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

          <div className={styles.progress}>
            {["Checklist", "Condición", "Confirmar"].map((label, i) => (
              <React.Fragment key={label}>
                <div
                  className={`${styles.progress__dot} ${
                    i <= stepIdx ? styles["progress__dot--done"] : ""
                  }`}
                >
                  {i < stepIdx ? <FiCheck size={10} /> : i + 1}
                </div>
                <span className={styles.progress__label}>{label}</span>
                {i < 2 && (
                  <div
                    className={`${styles.progress__line} ${
                      i < stepIdx ? styles["progress__line--done"] : ""
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className={styles.body}>
          {step === "checklist" && (
  <>
    <div className={styles.resumenGrid}>
      <div className={styles.equipoCard}>
        <p className={styles.equipoCard__title}>
          <MdOutlineDevices size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Ficha del equipo
        </p>

        <div className={styles.infoTable}>
          {[
            ["Tipo de dispositivo", tipo?.nombre || "—"],
            ["Marca", eq?.marca || "—"],
            ["Modelo", eq?.modelo || "—"],
            [
              "Condición declarada",
              CONDICIONES[eq?.condicionDeclarada]?.label ||
                eq?.condicionDeclarada ||
                "—",
            ],
            ["Antigüedad", eq?.antiguedad != null ? `${eq.antiguedad} año(s)` : "—"],
            ["Descripción", eq?.descripcion || "—"],
            [
              "Monto preliminar",
              `Bs. ${Number(solicitud?.montoInicial || 0).toLocaleString("es-BO")}`,
            ],
          ].map(([k, v]) => (
            <div key={k} className={styles.infoTable__row}>
              <div className={styles.infoTable__label}>{k}</div>
              <div className={styles.infoTable__value}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.galeriaCard}>
        <p className={styles.galeriaCard__title}>
          <FiCamera size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Fotos del cliente
        </p>

        {fotos.length > 0 ? (
          <div className={styles.galeriaGrid}>
            {fotos.map((foto, index) => {
              const src = typeof foto === "string" ? foto : foto.url;
              const nombre =
                typeof foto === "string"
                  ? `Foto ${index + 1}`
                  : foto.nombreArchivo || `Foto ${index + 1}`;

              return (
                <button
                  key={index}
                  type="button"
                  className={styles.galeriaGrid__item}
                  onClick={() => setFotoActiva(src)}
                >
                  <img src={src} alt={nombre} />
                  <span>{nombre}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={styles.galeriaEmpty}>
            No hay fotos adjuntas en esta solicitud.
          </div>
        )}
      </div>
    </div>

    <div className={styles.section}>
      <p className={styles.section__title}>
        <FiClipboard
          size={13}
          style={{ marginRight: 5, verticalAlign: "middle" }}
        />
        Checklist de inspección
      </p>

      <div className={styles.checklistSummary}>
        <div className={styles.checklistSummary__item}>
          <span>Completados</span>
          <strong>
            {completadosChecklist}/{totalChecklist}
          </strong>
        </div>
        <div className={styles.checklistSummary__item}>
          <span>Aprobados</span>
          <strong>{aprobadosChecklist}</strong>
        </div>
        <div className={styles.checklistSummary__item}>
          <span>Observados</span>
          <strong>{observadosChecklist}</strong>
        </div>
      </div>

      {obligatoriosPendientes.length > 0 && (
        <div className={styles.alertInfo}>
          <FiAlertTriangle size={15} />
          <span>
            Te faltan completar {obligatoriosPendientes.length} ítem(s)
            obligatorios.
          </span>
        </div>
      )}

      <div className={styles.checklist}>
        {checklistItems.map((item, index) => {
          const val = checkResults[item.codigo];
          const estadoVisual =
            val === true ? "ok" : val === false ? "no" : "neutral";

          return (
            <div
              key={item.codigo}
              className={`${styles.checklist__item} ${
                estadoVisual === "ok"
                  ? styles["checklist__item--ok"]
                  : estadoVisual === "no"
                  ? styles["checklist__item--no"]
                  : ""
              }`}
            >
              <div className={styles.checklist__itemHeader}>
                <div className={styles.checklist__itemIndex}>{index + 1}</div>

                <div className={styles.checklist__itemContent}>
                  <p className={styles.checklist__itemDesc}>
                    {item.descripcion}
                    {item.obligatorio && (
                      <span className={styles.checklist__required}>
                        {" "}
                        * Obligatorio
                      </span>
                    )}
                  </p>

                  <div className={styles.checklist__itemStatus}>
                    {val === null && (
                      <span className={styles.checklist__pill}>
                        Sin revisar
                      </span>
                    )}
                    {val === true && (
                      <span
                        className={`${styles.checklist__pill} ${styles["checklist__pill--ok"]}`}
                      >
                        Aprobado
                      </span>
                    )}
                    {val === false && (
                      <span
                        className={`${styles.checklist__pill} ${styles["checklist__pill--no"]}`}
                      >
                        Observado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.checklist__toggles}>
                <button
                  type="button"
                  className={`${styles.checklist__btn} ${
                    val === true ? styles["checklist__btn--ok"] : ""
                  }`}
                  onClick={() => toggleItem(item.codigo, true)}
                >
                  <FiCheck size={12} />
                  Sí
                </button>

                <button
                  type="button"
                  className={`${styles.checklist__btn} ${
                    val === false ? styles["checklist__btn--no"] : ""
                  }`}
                  onClick={() => toggleItem(item.codigo, false)}
                >
                  <FiXCircle size={12} />
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
)}

          {step === "condicion" && (
            <>
              <div className={styles.section}>
                <p className={styles.section__title}>Condición real del equipo</p>
                <div className={styles.condicionGrid}>
                  {Object.entries(CONDICIONES).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.condicionBtn} ${
                        condicionReal === key
                          ? styles["condicionBtn--active"]
                          : ""
                      }`}
                      onClick={() => setCondicionReal(key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.section__title}>
                  ¿La inspección requiere ajuste de cotización?
                </p>

                <div className={styles.ajusteToggles}>
                  <button
                    type="button"
                    className={`${styles.ajusteBtn} ${
                      requiereAjuste === true
                        ? styles["ajusteBtn--active"]
                        : ""
                    }`}
                    onClick={() => setRequiereAjuste(true)}
                  >
                    Sí, requiere ajuste
                  </button>

                  <button
                    type="button"
                    className={`${styles.ajusteBtn} ${
                      requiereAjuste === false
                        ? styles["ajusteBtn--noAjuste"]
                        : ""
                    }`}
                    onClick={() => {
                      setRequiereAjuste(false);
                      setMontoSugerido("");
                    }}
                  >
                    No, mantener monto
                  </button>
                </div>

                {requiereAjuste === true && (
                  <div className={styles.montoInput}>
                    <label>Monto sugerido (Bs.)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Ej: 2500"
                      value={montoSugerido}
                      onChange={(e) => setMontoSugerido(e.target.value)}
                    />
                  </div>
                )}

                <div className={styles.alertInfo} style={{ marginTop: 14 }}>
                  <FiInfo size={15} />
                  <span>
                    Si detectas diferencias frente a lo declarado por el cliente,
                    puedes registrar una condición real distinta y sugerir un nuevo
                    monto.
                  </span>
                </div>
              </div>
            </>
          )}

          {step === "confirmar" && (
            <div className={styles.confirmar}>
              <FiCheckCircle size={48} className={styles.confirmar__icon} />

              <h3 className={styles.confirmar__title}>Confirmar inspección</h3>

              <p className={styles.confirmar__text}>
                Estás a punto de registrar la inspección del equipo{" "}
                <strong>
                  {eq?.marca} {eq?.modelo}
                </strong>{" "}
                con condición real{" "}
                <strong>{CONDICIONES[condicionReal]?.label}</strong>.
              </p>

              <div className={styles.confirmar__resumen}>
                {[
                  [
                    "Ítems aprobados",
                    `${aprobadosChecklist} / ${totalChecklist}`,
                  ],
                  ["Ítems observados", `${observadosChecklist}`],
                  ["Condición real", CONDICIONES[condicionReal]?.label || "—"],
                  ["Requiere ajuste", requiereAjuste ? "Sí" : "No"],
                  ...(requiereAjuste
                    ? [
                        [
                          "Monto sugerido",
                          `Bs. ${Number(montoSugerido).toLocaleString("es-BO")}`,
                        ],
                      ]
                    : []),
                ].map(([k, v]) => (
                  <div key={k} className={styles.confirmar__row}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {step === "checklist" && (
            <>
              <button
                className={styles.footer__btnSecundario}
                onClick={onClose}
              >
                Cancelar
              </button>

              <button
                className={styles.footer__btnPrimario}
                onClick={() => setStep("condicion")}
                disabled={!checklistCompleto}
              >
                Siguiente
                <FiChevronRight size={15} />
              </button>
            </>
          )}

          {step === "condicion" && (
            <>
              <button
                className={styles.footer__btnSecundario}
                onClick={() => setStep("checklist")}
              >
                <FiChevronLeft size={15} />
                Atrás
              </button>

              <button
                className={styles.footer__btnPrimario}
                onClick={() => setStep("confirmar")}
                disabled={!condicionOk || !ajusteOk}
              >
                Revisar
                <FiChevronRight size={15} />
              </button>
            </>
          )}

          {step === "confirmar" && (
            <>
              <button
                className={styles.footer__btnSecundario}
                onClick={() => setStep("condicion")}
                disabled={loading}
              >
                <FiChevronLeft size={15} />
                Atrás
              </button>

              <button
                className={styles.footer__btnPrimario}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.footer__spinner} />
                ) : (
                  <FiCheckCircle size={16} />
                )}
                Registrar inspección
              </button>
            </>
          )}
        </div>
      </div>
      {fotoActiva && (
  <div
    className={styles.imageViewer}
    onClick={() => setFotoActiva(null)}
  >
    <div
      className={styles.imageViewer__content}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={styles.imageViewer__close}
        onClick={() => setFotoActiva(null)}
      >
        <FiX />
      </button>
      <img src={fotoActiva} alt="Vista ampliada" />
    </div>
  </div>
)}
    </div>
  );
};

export default InspeccionModal;