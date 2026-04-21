import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
  FiPackage,
} from "react-icons/fi";

import { crearSuscripcionThunk } from "../slicesSuscripcion/SuscripcionThunk";
import { obtenerPlanesThunk } from "../slicesPlanes/PlanThunk";
import { fetchPlanEmpresa } from "../../adminEmpresa/slicesPlanEmpresa/PlanEmpresaThunk";
import "./crearSuscripcion.scss";

const formatPrice = (value, moneda = "BOB") => {
  const number = Number(value || 0);
  return `${moneda} ${number.toFixed(2)}`;
};

const formatLimit = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).toLowerCase() === "ilimitado" ||
    Number(value) === -1
  ) {
    return "Ilimitado";
  }

  return value;
};

const formatHistorial = (value) => {
  if (value === null || value === undefined || value === "") {
    return "No definido";
  }

  if (String(value).toLowerCase() === "ilimitado") {
    return "Ilimitado";
  }

  const num = Number(value);
  if (Number.isNaN(num)) return value;

  return `${num} ${num === 1 ? "mes" : "meses"}`;
};

const formatReportes = (tipo) => {
  const raw = String(tipo || "").trim().toLowerCase();

  if (!raw) return "No definido";
  if (raw === "ninguno") return "Ninguno";
  if (raw === "basico") return "Básicos";
  if (raw === "avanzado") return "Avanzados";
  if (raw === "personalizado") return "Personalizado";

  return tipo;
};

const normalizePlanName = (value) =>
  String(value || "").trim().toLowerCase();

const PLAN_ORDER = {
  free: 1,
  basic: 2,
  premium: 3,
  enterprise: 4,
};

const getPlanLevel = (planName) => PLAN_ORDER[normalizePlanName(planName)] || 0;

const isUpgradePlan = (currentPlanName, newPlanName) => {
  const currentLevel = getPlanLevel(currentPlanName);
  const newLevel = getPlanLevel(newPlanName);

  if (!currentLevel || !newLevel) return false;
  return newLevel > currentLevel;
};

const isSamePlan = (currentPlanName, newPlanName) =>
  normalizePlanName(currentPlanName) === normalizePlanName(newPlanName);

const CrearSuscripcion = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const planActual = useSelector((state) => state.planEmpresa?.planActual);

  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [nombrePlan, setNombrePlan] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingCrear, setLoadingCrear] = useState(false);

  const [form, setForm] = useState({
    user_id: 1,
    servicio_id: 2,
    meses: 1,
    precio_unitario: 0,
    moneda: "BOB",
  });

  useEffect(() => {
    dispatch(fetchPlanEmpresa());
  }, [dispatch]);

  useEffect(() => {
    const cargarPlan = async () => {
      try {
        setLoadingPlan(true);

        const planes = await dispatch(obtenerPlanesThunk()).unwrap();

        const plan = planes.find((p) => Number(p.id_plan) === Number(id));

        if (!plan) {
          await Swal.fire({
            icon: "warning",
            title: "Plan no encontrado",
            text: "No se encontró el plan seleccionado.",
          });
          navigate("/planes-pagos");
          return;
        }

        setPlanSeleccionado(plan);
        setNombrePlan(plan.nombre || "");
        setForm((prev) => ({
          ...prev,
          precio_unitario: parseFloat(plan.precio || 0),
        }));
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error al cargar planes",
          text: error || "No se pudieron obtener los planes",
        });
      } finally {
        setLoadingPlan(false);
      }
    };

    cargarPlan();
  }, [dispatch, id, navigate]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "meses" ? Math.max(1, Number(value) || 1) : value,
    }));
  };

  const total = useMemo(() => {
    return (Number(form.meses) || 0) * (Number(form.precio_unitario) || 0);
  }, [form.meses, form.precio_unitario]);

  const resumenPlan = useMemo(() => {
    if (!planSeleccionado) return [];

    return [
      {
        label: "Dispositivos",
        value: formatLimit(planSeleccionado.max_dispositivos),
      },
      {
        label: "Reglas",
        value: formatLimit(planSeleccionado.max_reglas),
      },
      {
        label: "Inspectores",
        value: formatLimit(planSeleccionado.max_inspectores),
      },
      {
        label: "Cotizaciones / mes",
        value: formatLimit(planSeleccionado.max_cotizaciones_mes),
      },
      {
        label: "Historial",
        value: formatHistorial(planSeleccionado.meses_historial),
      },
      {
        label: "Reportes",
        value: formatReportes(planSeleccionado.tipo_reportes),
      },
      {
        label: "Exportación",
        value: planSeleccionado.puede_exportar ? "Sí" : "No",
      },
    ];
  }, [planSeleccionado]);

  const handleCrear = async () => {
  try {
    if (!planSeleccionado) return;

    const nombrePlanNuevo = nombrePlan || planSeleccionado?.nombre || "";

    setLoadingCrear(true);

    const response = await dispatch(
      crearSuscripcionThunk({
        user_id: form.user_id,
        servicio_id: form.servicio_id,
        meses: Number(form.meses),
        precio_unitario: Number(form.precio_unitario),
        moneda: form.moneda,
        nombre_plan: nombrePlanNuevo,
        force: true,
      })
    ).unwrap();

    const suscripcion =
      response?.suscripcion ||
      response?.data?.suscripcion ||
      response?.data ||
      response;

    await Swal.fire({
      icon: "success",
      title: "Suscripción creada",
      text: "La suscripción fue creada correctamente. Ahora puedes proceder al pago.",
    });

    navigate(`/checkout-pagos/${suscripcion.id_suscripcion_pago}`);
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: error || "No se pudo crear la suscripción",
    });
  } finally {
    setLoadingCrear(false);
  }
};
  return (
    <div className="crear-suscripcion-page">
      <div className="crear-suscripcion-page__bg" />

      <div className="crear-suscripcion">
        <div className="crear-suscripcion__topbar">
          <button
            type="button"
            className="crear-suscripcion__back"
            onClick={() => navigate("/planes-pagos")}
          >
            <FiArrowLeft size={16} />
            Volver a planes
          </button>
        </div>

        <div className="crear-suscripcion__grid">
          <section className="crear-suscripcion__main card-main">
            <div className="card-main__header">
              <span className="card-main__eyebrow">Suscripción</span>
              <h1>Crear suscripción</h1>
              <p>
                Configura la duración de tu plan y revisa el total antes de
                continuar con el pago.
              </p>
            </div>

            <div className="card-main__selected">
              <div className="selected-plan">
                <div className="selected-plan__icon">
                  <FiPackage size={20} />
                </div>

                <div className="selected-plan__content">
                  <span>Plan seleccionado</span>
                  <strong>
                    {loadingPlan
                      ? "Cargando plan..."
                      : nombrePlan || "Sin plan seleccionado"}
                  </strong>
                  <p>
                    {planSeleccionado
                      ? `Precio base mensual: ${formatPrice(
                          planSeleccionado.precio,
                          form.moneda
                        )}`
                      : "Estamos obteniendo los datos del plan."}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-main__form">
              <div className="form-field">
                <label>
                  <FiCalendar size={15} />
                  Meses
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.meses}
                  onChange={(e) => handleChange("meses", e.target.value)}
                  disabled={loadingPlan || loadingCrear}
                />
              </div>

              <div className="form-field">
                <label>
                  <FiCreditCard size={15} />
                  Precio unitario
                </label>
                <input
                  type="text"
                  value={formatPrice(form.precio_unitario, form.moneda)}
                  readOnly
                />
              </div>

              <div className="form-field">
                <label>Moneda</label>
                <select
                  value={form.moneda}
                  onChange={(e) => handleChange("moneda", e.target.value)}
                  disabled={loadingPlan || loadingCrear}
                >
                  <option value="BOB">BOB</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="card-main__summary">
              <div className="summary-row">
                <span>Duración</span>
                <strong>
                  {form.meses} {Number(form.meses) === 1 ? "mes" : "meses"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Total</span>
                <strong className="summary-row__total">
                  {formatPrice(total, form.moneda)}
                </strong>
              </div>
            </div>

            <button
              className="card-main__cta"
              onClick={handleCrear}
              disabled={loadingPlan || loadingCrear || !planSeleccionado}
            >
              {loadingCrear ? "Creando..." : "Crear y pagar"}
            </button>
          </section>

          <aside className="crear-suscripcion__aside card-aside">
            <div className="card-aside__header">
              <h2>Detalles del plan</h2>
              <p>Capacidades incluidas en la suscripción seleccionada.</p>
            </div>

            {loadingPlan ? (
              <div className="card-aside__loading">Cargando detalles...</div>
            ) : (
              <>
                <div className="card-aside__price">
                  <span>Precio mensual</span>
                  <strong>{formatPrice(planSeleccionado?.precio, form.moneda)}</strong>
                </div>

                <div className="card-aside__features">
                  {resumenPlan.map((item) => (
                    <div className="feature-item" key={item.label}>
                      <div className="feature-item__left">
                        <FiCheckCircle size={15} />
                        <span>{item.label}</span>
                      </div>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CrearSuscripcion;