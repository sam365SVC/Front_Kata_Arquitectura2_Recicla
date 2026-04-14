import React, { useMemo } from "react";
import {
  FiCheck,
  FiX,
  FiStar,
  FiBox,
  FiZap,
  FiUsers,
  FiClock,
  FiBarChart2,
  FiArrowUpRight,
} from "react-icons/fi";
import styles from "./PlanChangeModal.module.scss";

const featureValue = (value) => {
  if (value === null || value === undefined || value === "") return "No";
  return value;
};

const isPositiveFeature = (value) => {
  const normalized = String(value || "").toLowerCase().trim();
  return normalized !== "no";
};

const PlanChangeModal = ({
  open,
  onClose,
  currentPlanId,
  plans = [],
  onChangePlan,
}) => {
  const currentPlan = useMemo(
    () => plans.find((plan) => plan.id === currentPlanId) || null,
    [plans, currentPlanId]
  );

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div>
            <h3>
              <FiStar size={18} />
              Cambiar plan
            </h3>
            <p>
              Compara las capacidades de cada plan y elige el que mejor se adapte
              al crecimiento de tu empresa.
            </p>
          </div>

          <button type="button" onClick={onClose} aria-label="Cerrar modal">
            <FiX />
          </button>
        </div>

        <div className={styles.body}>
          {currentPlan && (
            <div className={styles.currentBanner}>
              <span className={styles.currentBanner__label}>Plan actual</span>
              <strong>{currentPlan.nombre}</strong>
              <p>
                Actualmente estás usando este plan. Puedes mantenerlo o cambiar a
                una opción superior o diferente.
              </p>
            </div>
          )}

          <div className={styles.planGrid}>
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;

              return (
                <article
                  key={plan.id}
                  className={`${styles.planCard} ${
                    isCurrent ? styles.planCardActive : ""
                  }`}
                >
                  <div className={styles.planCard__top}>
                    <div>
                      <div className={styles.planCard__titleRow}>
                        <h4>{plan.nombre}</h4>
                        {isCurrent && (
                          <span className={styles.planBadge}>Actual</span>
                        )}
                      </div>

                      <p className={styles.planSubtitle}>
                        {plan.nombre === "Free" &&
                          "Ideal para comenzar y probar la plataforma."}
                        {plan.nombre === "Basic" &&
                          "Para operaciones pequeñas con necesidades iniciales."}
                        {plan.nombre === "Premium" &&
                          "Para empresas en crecimiento con mayor operación."}
                        {plan.nombre === "Enterprise" &&
                          "Para operaciones avanzadas con necesidades amplias."}
                      </p>
                    </div>

                    <div className={styles.planPrice}>
                      {plan.precio === null ? (
                        <>
                          <strong>Personalizado</strong>
                          <span>contáctanos</span>
                        </>
                      ) : (
                        <>
                          <strong>Bs. {plan.precio}</strong>
                          <span>por mes</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.planHighlights}>
                    <div className={styles.planHighlight}>
                      <FiBox size={15} />
                      <span>{plan.dispositivos} dispositivos</span>
                    </div>
                    <div className={styles.planHighlight}>
                      <FiZap size={15} />
                      <span>{plan.reglas} reglas</span>
                    </div>
                    <div className={styles.planHighlight}>
                      <FiUsers size={15} />
                      <span>{plan.inspectores} inspectores</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isCurrent}
                    className={styles.selectButton}
                    onClick={() => onChangePlan?.(plan.id)}
                  >
                    <FiArrowUpRight size={15} />
                    {isCurrent ? "Plan actual" : "Elegir plan"}
                  </button>
                </article>
              );
            })}
          </div>

          <div className={styles.comparisonSection}>
            <div className={styles.comparisonHeader}>
              <h4>Comparación detallada</h4>
              <p>
                Revisa exactamente qué incluye cada plan y qué capacidades cambian
                entre uno y otro.
              </p>
            </div>

            <div className={styles.comparisonTableWrap}>
              <table className={styles.comparisonTable}>
                <thead>
                  <tr>
                    <th>Característica</th>
                    {plans.map((plan) => (
                      <th key={plan.id}>
                        <div className={styles.tablePlanHead}>
                          <span>{plan.nombre}</span>
                          {plan.id === currentPlanId && (
                            <small>Actual</small>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className={styles.featureCell}>
                      <FiBox size={15} />
                      Dispositivos en catálogo
                    </td>
                    {plans.map((plan) => (
                      <td key={`${plan.id}-dispositivos`}>{plan.dispositivos}</td>
                    ))}
                  </tr>

                  <tr>
                    <td className={styles.featureCell}>
                      <FiZap size={15} />
                      Reglas de cotización
                    </td>
                    {plans.map((plan) => (
                      <td key={`${plan.id}-reglas`}>{plan.reglas}</td>
                    ))}
                  </tr>

                  <tr>
                    <td className={styles.featureCell}>
                      <FiUsers size={15} />
                      Usuarios inspectores
                    </td>
                    {plans.map((plan) => (
                      <td key={`${plan.id}-inspectores`}>{plan.inspectores}</td>
                    ))}
                  </tr>

                  <tr>
                    <td className={styles.featureCell}>
                      <FiClock size={15} />
                      Historial de operaciones
                    </td>
                    {plans.map((plan) => (
                      <td key={`${plan.id}-historial`}>{plan.historial}</td>
                    ))}
                  </tr>

                  <tr>
                    <td className={styles.featureCell}>
                      <FiBarChart2 size={15} />
                      Reportes
                    </td>
                    {plans.map((plan) => (
                      <td key={`${plan.id}-reportes`}>
                        <span
                          className={`${styles.reportBadge} ${
                            isPositiveFeature(plan.reportes)
                              ? styles.reportBadgeOk
                              : styles.reportBadgeNo
                          }`}
                        >
                          {isPositiveFeature(plan.reportes) ? (
                            <FiCheck size={14} />
                          ) : (
                            <FiX size={14} />
                          )}
                          {featureValue(plan.reportes)}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanChangeModal;