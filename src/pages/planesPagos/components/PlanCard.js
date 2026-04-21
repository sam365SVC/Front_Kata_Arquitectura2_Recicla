import React from "react";
import { useNavigate } from "react-router-dom";

function formatReportes(tipo) {
  const raw = String(tipo || "").trim().toLowerCase();

  if (!raw) return "No definido";
  if (raw === "ninguno") return "Ninguno";
  if (raw === "basico") return "Básicos";
  if (raw === "avanzado") return "Avanzados";
  if (raw === "personalizado") return "Personalizado";

  return tipo;
}

function formatHistorial(value) {
  if (value === null || value === undefined || value === "") return "No definido";

  const raw = String(value).trim().toLowerCase();
  if (raw === "ilimitado") return "Ilimitado";

  const num = Number(value);
  if (Number.isNaN(num)) return value;

  return `${num} ${num === 1 ? "mes" : "meses"}`;
}

function formatLimit(value) {
  if (
    value === -1 ||
    String(value).toLowerCase() === "ilimitado"
  ) {
    return "Ilimitado";
  }
  return value;
}

function formatPrecio(precio) {
  const num = Number(precio);
  if (Number.isNaN(num)) return precio;
  if (num === 0) return "Gratis";
  return num.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function PlanCard({
  plan,
  modo = "suscripcion",
  onSelectPlan,
  currentPlanId = null,
  loading = false,
}) {
  const navigate = useNavigate();

  const {
    id_plan,
    nombre,
    precio,
    descripcion,
    destacado,
    etiqueta,
    max_dispositivos,
    max_reglas,
    max_inspectores,
    max_cotizaciones_mes,
    meses_historial,
    tipo_reportes,
    puede_exportar,
    caracteristicas_extra = [],
  } = plan;

  const esGratis = Number(precio) === 0;
  const isCurrent = String(currentPlanId) === String(id_plan);

  const specs = [
    { label: "Dispositivos", value: formatLimit(max_dispositivos) },
    { label: "Reglas", value: formatLimit(max_reglas) },
    { label: "Inspectores", value: formatLimit(max_inspectores) },
    { label: "Cotizaciones / mes", value: formatLimit(max_cotizaciones_mes) },
    { label: "Historial", value: formatHistorial(meses_historial) },
    { label: "Reportes", value: formatReportes(tipo_reportes) },
    { label: "Exportación", value: puede_exportar ? "Sí" : "No" },
  ];

  const handleClick = () => {
    if (isCurrent) return;

    if (modo === "empresa") {
      onSelectPlan?.(plan);
      return;
    }

    navigate(`/crear-suscripcion/${id_plan}`);
  };

  const buttonText =
    modo === "empresa"
      ? isCurrent
        ? "Plan actual"
        : `Cambiar a ${nombre}`
      : isCurrent
      ? "Plan actual"
      : esGratis
      ? "Comenzar gratis"
      : `Obtener ${nombre}`;

  return (
    <article
      className={[
        "plan-card",
        destacado ? "plan-card--featured" : "",
        isCurrent ? "plan-card--current" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {etiqueta && !isCurrent && (
        <span className="plan-card__badge">{etiqueta}</span>
      )}

      <header className="plan-card__header">
        <h2 className="plan-card__nombre">{nombre}</h2>
        {descripcion && <p className="plan-card__descripcion">{descripcion}</p>}
      </header>

      <div className="plan-card__precio-wrapper">
        {!esGratis && <span className="plan-card__precio-moneda">BOB</span>}
        <span className="plan-card__precio">
          {esGratis ? "Gratis" : formatPrecio(precio)}
        </span>
        {!esGratis && (
          <span className="plan-card__precio-periodo">/mes</span>
        )}
      </div>

      <button
        className={[
          "plan-card__cta",
          isCurrent ? "plan-card__cta--current" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleClick}
        disabled={loading || isCurrent}
      >
        {loading ? "Procesando..." : buttonText}
      </button>

      <div className="plan-card__divider" />

      {caracteristicas_extra.length > 0 && (
        <>
          <p className="plan-card__section-label">Incluye</p>
          <ul className="plan-card__features-list">
            {caracteristicas_extra.map((item, idx) => (
              <li key={idx} className="plan-card__feature">
                <span className="plan-card__feature-icon">✓</span>
                <span className="plan-card__feature-text">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="plan-card__specs">
        {specs.map(({ label, value }) => (
          <div key={label} className="plan-card__spec-row">
            <span className="plan-card__spec-label">{label}</span>
            <span className="plan-card__spec-value">{value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default PlanCard;