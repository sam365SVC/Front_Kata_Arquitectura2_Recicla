import React, { useEffect, useState } from "react";
import PlanCard from "./PlanCard";
import "./planesPagos.scss";

import { fetchPlanes } from "../mock/data";


import { useDispatch, useSelector } from "react-redux";
import { planesSlice } from "../slicesPlanes/PlanSlice";
import { obtenerPlanesThunk } from "../slicesPlanes/PlanThunk";

function PlanesPagos() {
  const dispatch = useDispatch();

  const { planes, cargando, error } = useSelector((state) => state.planes);
  
  useEffect(() => {
    dispatch(obtenerPlanesThunk());
  }, [dispatch]);


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
