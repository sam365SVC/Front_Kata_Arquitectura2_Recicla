import React from "react";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';


function PlanCard({ plan }) {

  const navigate = useNavigate();
  
  const {
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

  const esGratis = precio === 0;

  const specs = [
    { label: "Dispositivos",       value: max_dispositivos === -1 ? "Ilimitados" : max_dispositivos },
    { label: "Reglas",             value: max_reglas === -1       ? "Ilimitadas"  : max_reglas },
    { label: "Inspectores",        value: max_inspectores === -1  ? "Ilimitados" : max_inspectores },
    { label: "Cotizaciones / mes", value: max_cotizaciones_mes === -1 ? "Ilimitadas" : max_cotizaciones_mes },
    { label: "Historial",          value: `${meses_historial} ${meses_historial === 1 ? "mes" : "meses"}` },
    { label: "Reportes",           value: tipo_reportes },
    { label: "Exportación",        value: puede_exportar ? "Sí" : "No" },
  ];
  const handleClick = () => {
    navigate(`/crear-suscripcion/${plan.id_plan}`);
  };
  return (
    <article className={`plan-card${destacado ? " plan-card--featured" : ""}`}>
      {etiqueta && <span className="plan-card__badge">{etiqueta}</span>}

      {/* Header */}
      <header className="plan-card__header">
        <h2 className="plan-card__nombre">{nombre}</h2>
        {descripcion && <p className="plan-card__descripcion">{descripcion}</p>}
      </header>

      {/* Precio */}
      <div className="plan-card__precio-wrapper">
        {!esGratis && <span className="plan-card__precio-moneda">USD</span>}
        <span className="plan-card__precio">
          {esGratis ? "Gratis" : precio}
        </span>
        {!esGratis && (
          <span className="plan-card__precio-periodo">/mes</span>
        )}
      </div>

      {/* CTA */}
      <button className="plan-card__cta" onClick={handleClick}>
        {esGratis ? "Comenzar gratis" : `Obtener ${nombre}`}
      </button>

      <div className="plan-card__divider" />

      {/* Características extra */}
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

      {/* Specs de BD */}
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
