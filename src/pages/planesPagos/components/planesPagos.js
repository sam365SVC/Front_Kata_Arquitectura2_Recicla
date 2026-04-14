import React, { useEffect, useState } from "react";
import PlanCard from "./PlanCard";
import "./planesPagos.scss";

// ─── Origen de datos ──────────────────────────────────────────────────────────
// En desarrollo se usa el mock; en producción apunta al endpoint real.
// Para cambiar al endpoint real, sustituye la importación por:
//   import { fetchPlanes } from "../../../services/planesService";
// y elimina la de abajo.
import { fetchPlanes } from "../mock/data";

// Cuando el backend esté listo, usar algo como:
// async function fetchPlanes() {
//   const res = await fetch("/api/planes");
//   if (!res.ok) throw new Error("Error al obtener los planes");
//   return res.json();
// }

function PlanesPagos() {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const data = await fetchPlanes();
        if (!cancelado) setPlanes(data);
      } catch (err) {
        if (!cancelado) setError(err.message || "Error desconocido");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => { cancelado = true; };
  }, []);

  return (
    <main className="planes-pagos">
      {/* Hero */}
      <section className="planes-pagos__hero">
        <span className="planes-pagos__eyebrow">Planes & Precios</span>
        <h1 className="planes-pagos__title">
          Elige el plan <span>que se adapta</span> a ti
        </h1>
        <p className="planes-pagos__subtitle">
          Consulta los planes disponibles, sus límites y funcionalidades incluidas.
        </p>
      </section>

      {/* Cards */}
      {cargando && (
        <p className="planes-pagos__loading">Cargando planes…</p>
      )}

      {error && (
        <p className="planes-pagos__error">No se pudieron cargar los planes: {error}</p>
      )}

      {!cargando && !error && (
        <div className="planes-pagos__grid">
          {planes.map((plan) => (
            <PlanCard key={plan.id_plan} plan={plan} />
          ))}
        </div>
      )}

      {/* Nota al pie */}
      {!cargando && !error && (
        <p className="planes-pagos__footer-note">
          ¿Necesitas algo a medida?{" "}
          <a href="mailto:contacto@tuempresa.com">Contáctanos</a> para un plan empresarial.
        </p>
      )}
    </main>
  );
}

export default PlanesPagos;
