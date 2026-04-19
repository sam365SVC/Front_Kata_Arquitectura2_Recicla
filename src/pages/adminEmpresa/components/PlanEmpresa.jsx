import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  FiCreditCard,
  FiCheckCircle,
  FiLayers,
  FiUsers,
  FiCpu,
  FiArrowUpRight,
  FiBarChart2,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import styles from "./PlanEmpresa.module.scss";
import PlanChangeModal from "./PlanChangeModal";
import {
  fetchPlanEmpresa,
  fetchPlanesDisponibles,
  cambiarPlanEmpresa,
} from "../slicesPlanEmpresa/PlanEmpresaThunk";
import {
  selectPlanEmpresa,
  selectPlanesDisponibles,
  selectPlanEmpresaLoading,
  selectPlanEmpresaError,
  selectPlanEmpresaSuccess,
  clearPlanEmpresaError,
  clearPlanEmpresaSuccess,
} from "../slicesPlanEmpresa/PlanEmpresaSlice";

const usoMock = {
  dispositivos: { usados: 2 },
  reglas: { usadas: 9 },
  inspectores: { usados: 2 },
};

const formatPrice = (precio, moneda = "Bs.") => {
  if (precio === null || precio === undefined) return "Personalizado";
  return `${moneda} ${Number(precio).toLocaleString("es-BO")}`;
};

const toNumberIfPossible = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const porcentaje = (usados, total) => {
  const totalNum = Number(total);
  if (!totalNum || Number.isNaN(totalNum)) return 0;
  return Math.min(100, Math.round((Number(usados || 0) / totalNum) * 100));
};

const buildSwalClasses = () => ({
  popup: styles.swalPopup,
  title: styles.swalTitle,
  htmlContainer: styles.swalText,
  confirmButton: styles.swalConfirm,
  cancelButton: styles.swalCancel,
});

const PlanEmpresa = ({ empresaNombre = "Recicla Tech S.R.L." }) => {
  const dispatch = useDispatch();

  const planActual = useSelector(selectPlanEmpresa);
  const planesDisponibles = useSelector(selectPlanesDisponibles);
  const loading = useSelector(selectPlanEmpresaLoading);
  const error = useSelector(selectPlanEmpresaError);
  const successMessage = useSelector(selectPlanEmpresaSuccess);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPlanEmpresa());
    dispatch(fetchPlanesDisponibles());
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;

    Swal.fire({
      icon: "error",
      title: "No se pudo completar la operación",
      text: error,
      confirmButtonText: "Entendido",
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });

    dispatch(clearPlanEmpresaError());
  }, [error, dispatch]);

  useEffect(() => {
    if (!successMessage) return;

    Swal.fire({
      icon: "success",
      title: "Operación realizada",
      text: successMessage,
      confirmButtonText: "Perfecto",
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });

    dispatch(clearPlanEmpresaSuccess());
  }, [successMessage, dispatch]);

  const beneficios = useMemo(() => {
    if (!planActual) return [];

    return [
      `${planActual.dispositivos} dispositivos en catálogo`,
      `${planActual.reglas} reglas de cotización`,
      `${planActual.inspectores} usuarios inspectores`,
      `Historial de operaciones: ${planActual.historial}`,
      `Reportes: ${planActual.reportes}`,
    ];
  }, [planActual]);

  const handleRefresh = () => {
    dispatch(fetchPlanEmpresa());
    dispatch(fetchPlanesDisponibles());
  };

  const handleChangePlan = async (planId) => {
    const selectedPlan = (planesDisponibles || []).find((p) => p.id === planId);

    if (!selectedPlan) return;

    if (selectedPlan.id === planActual?.id) {
      await Swal.fire({
        icon: "info",
        title: "Ya tienes este plan",
        text: "Este es tu plan actual.",
        confirmButtonText: "Entendido",
        buttonsStyling: false,
        customClass: buildSwalClasses(),
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: `¿Cambiar a ${selectedPlan.nombre}?`,
      html: `
        <div>
          Se actualizará tu suscripción al plan <b>${selectedPlan.nombre}</b>.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar plan",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });

    if (!confirm.isConfirmed) return;

    await dispatch(cambiarPlanEmpresa(planId));
    setModalOpen(false);
  };

  if (loading && !planActual) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.hero}>
          <div>
            <span className={styles.hero__eyebrow}>Suscripción actual</span>
            <h2>Mi plan</h2>
            <p>Cargando la información de tu plan...</p>
          </div>
        </div>

        <div className={styles.loadingCard}>
          <div className={styles.loadingCard__spinner} />
          <span>Obteniendo plan actual y planes disponibles</span>
        </div>
      </section>
    );
  }

  if (!planActual) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.hero}>
          <div>
            <span className={styles.hero__eyebrow}>Suscripción actual</span>
            <h2>Mi plan</h2>
            <p>No se pudo cargar la información del plan.</p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleRefresh}
          >
            <FiRefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={styles.wrapper}>
        <div className={styles.hero}>
          <div>
            <span className={styles.hero__eyebrow}>Suscripción actual</span>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw size={16} />
            Actualizar
          </button>
        </div>

        <div className={styles.currentPlanCard}>
          <div className={styles.currentPlanCard__top}>
            <div className={styles.planIdentity}>
              <div className={styles.planIdentity__icon}>
                <FiCreditCard size={20} />
              </div>

              <div>
                <span className={styles.planBadge}>Plan actual</span>
                <h3>{planActual.nombre}</h3>
                <p>{empresaNombre}</p>
              </div>
            </div>

            <div className={styles.priceBlock}>
              <strong>{formatPrice(planActual.precio, planActual.moneda)}</strong>
              <span>
                {planActual.precio === null || planActual.precio === undefined
                  ? "contáctanos"
                  : "por mes"}
              </span>
            </div>
          </div>

          <div className={styles.currentPlanCard__meta}>
            <div>
              <span>Estado</span>
              <strong>{planActual.estado || "Activo"}</strong>
            </div>
            <div>
              <span>Renovación</span>
              <strong>{planActual.renovacion || "Sin fecha"}</strong>
            </div>
            <div>
              <span>Método</span>
              <strong>{planActual.metodoPago || "No definido"}</strong>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <article className={styles.panel}>
            <div className={styles.panel__header}>
              <h3>Beneficios del plan</h3>
              <span>Capacidades actuales incluidas</span>
            </div>

            <div className={styles.benefitsList}>
              {beneficios.map((beneficio) => (
                <div key={beneficio} className={styles.benefitItem}>
                  <FiCheckCircle size={16} />
                  <span>{beneficio}</span>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panel__header}>
              <h3>Consumo actual del plan</h3>
              <span>Uso estimado de recursos disponibles</span>
            </div>

            <div className={styles.usageList}>
              <div className={styles.usageItem}>
                <div className={styles.usageItem__top}>
                  <div className={styles.usageItem__label}>
                    <FiCpu size={15} />
                    <span>Dispositivos en catálogo</span>
                  </div>
                  <strong>
                    {usoMock.dispositivos.usados}/{planActual.dispositivos}
                  </strong>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressBar__fill}
                    style={{
                      width: `${porcentaje(
                        usoMock.dispositivos.usados,
                        toNumberIfPossible(planActual.dispositivos)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className={styles.usageItem}>
                <div className={styles.usageItem__top}>
                  <div className={styles.usageItem__label}>
                    <FiLayers size={15} />
                    <span>Reglas de cotización</span>
                  </div>
                  <strong>
                    {usoMock.reglas.usadas}/{planActual.reglas}
                  </strong>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressBar__fill}
                    style={{
                      width: `${porcentaje(
                        usoMock.reglas.usadas,
                        toNumberIfPossible(planActual.reglas)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className={styles.usageItem}>
                <div className={styles.usageItem__top}>
                  <div className={styles.usageItem__label}>
                    <FiUsers size={15} />
                    <span>Usuarios inspectores</span>
                  </div>
                  <strong>
                    {usoMock.inspectores.usados}/{planActual.inspectores}
                  </strong>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressBar__fill}
                    style={{
                      width: `${porcentaje(
                        usoMock.inspectores.usados,
                        toNumberIfPossible(planActual.inspectores)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className={styles.usageInfoRow}>
                <div className={styles.usageInfoCard}>
                  <FiClock size={16} />
                  <div>
                    <span>Historial</span>
                    <strong>{planActual.historial}</strong>
                  </div>
                </div>

                <div className={styles.usageInfoCard}>
                  <FiBarChart2 size={16} />
                  <div>
                    <span>Reportes</span>
                    <strong>{planActual.reportes}</strong>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <article className={styles.comparisonCard}>
          <div className={styles.comparisonCard__header}>
            <div>
              <span className={styles.comparisonEyebrow}>Comparación</span>
              <h3>Planes disponibles</h3>
              <p>
                Compara las capacidades de cada plan y prepárate para cambiar de
                nivel cuando lo necesites.
              </p>
            </div>

            <button
              type="button"
              className={styles.upgradeButton}
              onClick={() => setModalOpen(true)}
            >
              <FiArrowUpRight size={16} />
              Cambiar plan
            </button>
          </div>

          <div className={styles.planTableWrap}>
            <table className={styles.planTable}>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Dispositivos en catálogo</th>
                  <th>Reglas de cotización</th>
                  <th>Usuarios inspectores</th>
                  <th>Historial de operaciones</th>
                  <th>Reportes</th>
                </tr>
              </thead>
              <tbody>
                {(planesDisponibles || []).map((plan) => (
                  <tr
                    key={plan.id}
                    className={plan.id === planActual.id ? styles.currentRow : ""}
                  >
                    <td>
                      <div className={styles.planNameCell}>
                        <strong>{plan.nombre}</strong>
                        {plan.id === planActual.id && (
                          <span className={styles.currentLabel}>Actual</span>
                        )}
                      </div>
                    </td>
                    <td>{plan.dispositivos}</td>
                    <td>{plan.reglas}</td>
                    <td>{plan.inspectores}</td>
                    <td>{plan.historial}</td>
                    <td>{plan.reportes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <PlanChangeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currentPlanId={planActual.id}
        plans={planesDisponibles}
        onChangePlan={handleChangePlan}
      />
    </>
  );
};

export default PlanEmpresa;