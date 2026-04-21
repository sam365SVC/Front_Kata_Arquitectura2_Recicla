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
  return normalized !== "no" && normalized !== "ninguno" && normalized !== "-";
};

const formatPrice = (precio, moneda = "Bs.") => {
  if (precio === null || precio === undefined || precio === "") {
    return "Personalizado";
  }

  const parsed = Number(precio);

  if (Number.isNaN(parsed)) {
    return `${moneda} ${precio}`;
  }

  return `${moneda} ${parsed.toLocaleString("es-BO")}`;
};

const getPlanSubtitle = (plan) => {
  const nombre = String(plan?.nombre || "").toLowerCase();

  if (nombre.includes("free")) {
    return "Ideal para comenzar y probar la plataforma.";
  }

  if (nombre.includes("basic")) {
    return "Para operaciones pequeñas con necesidades iniciales.";
  }

  if (nombre.includes("premium")) {
    return "Para empresas en crecimiento con mayor operación.";
  }

  if (nombre.includes("enterprise")) {
    return "Para operaciones avanzadas con necesidades amplias.";
  }

  return "Una opción diseñada para ajustarse a las necesidades de tu empresa.";
};

const PlanChangeModal = ({
  open,
  onClose,
  currentPlanId,
  plans = [],
  onChangePlan,
}) => {
  const currentPlan = useMemo(
    () =>
      plans.find((plan) => String(plan.id) === String(currentPlanId)) || null,
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
              const isCurrent = String(plan.id) === String(currentPlanId);

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
                        <h4>{plan.nombre || "Sin nombre"}</h4>
                        {isCurrent && (
                          <span className={styles.planBadge}>Actual</span>
                        )}
                      </div>

                      <p className={styles.planSubtitle}>
                        {getPlanSubtitle(plan)}
                      </p>
                    </div>

                    <div className={styles.planPrice}>
                      {plan.precio === null || plan.precio === undefined ? (
                        <>
                          <strong>Personalizado</strong>
                          <span>contáctanos</span>
                        </>
                      ) : (
                        <>
                          <strong>{formatPrice(plan.precio, plan.moneda)}</strong>
                          <span>por mes</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.planHighlights}>
                    <div className={styles.planHighlight}>
                      <FiBox size={15} />
                      <span>{featureValue(plan.dispositivos)} dispositivos</span>
                    </div>

                    <div className={styles.planHighlight}>
                      <FiZap size={15} />
                      <span>{featureValue(plan.reglas)} reglas</span>
                    </div>

                    <div className={styles.planHighlight}>
                      <FiUsers size={15} />
                      <span>{featureValue(plan.inspectores)} inspectores</span>
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
                          <span>{plan.nombre || "Sin nombre"}</span>
                          {String(plan.id) === String(currentPlanId) && (
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
                      <td key={`${plan.id}-dispositivos`}>
                        {featureValue(plan.dispositivos)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className={styles.featureCell}>
                      <FiZap size={15} />
                      Reglas de cotización
                    </td>
                    {plans.map((plan) => (
                      <td key={`${plan.id}-reglas`}>
                        {featureValue(plan.reglas)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className={styles.featureCell}>
                      <FiUsers size={15} />
                      Usuarios inspectores
                    </td>
                    {plans.map((plan) => (
                      <td key={`${plan.id}-inspectores`}>
                        {featureValue(plan.inspectores)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className={styles.featureCell}>
                      <FiClock size={15} />
                      Historial de operaciones
                    </td>
                    {plans.map((plan) => (
                      <td key={`${plan.id}-historial`}>
                        {featureValue(plan.historial)}
                      </td>
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