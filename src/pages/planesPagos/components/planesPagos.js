import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PlanCard from "./PlanCard";
import "./planesPagos.scss";

import { obtenerPlanesThunk } from "../slicesPlanes/PlanThunk";
import {
  fetchPlanEmpresa,
  cambiarPlanEmpresa,
} from "../../adminEmpresa/slicesPlanEmpresa/PlanEmpresaThunk";

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function PlanesPagos({ modo = "suscripcion" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { planes, cargando, error } = useSelector((state) => state.planes);
  const planActual = useSelector((state) => state.planEmpresa?.planActual);

  const [loadingChange, setLoadingChange] = useState(false);

  useEffect(() => {
    dispatch(obtenerPlanesThunk());

    if (modo === "empresa") {
      dispatch(fetchPlanEmpresa());
    }
  }, [dispatch, modo]);

  const planesList = useMemo(() => {
    if (Array.isArray(planes)) return planes;
    if (Array.isArray(planes?.data)) return planes.data;
    return [];
  }, [planes]);

  const currentPlanId = useMemo(() => {
    if (!planActual || planesList.length === 0) return null;

    const match = planesList.find((plan) => {
      const sameId =
        String(plan.id_plan) === String(planActual.id);

      const sameName =
        normalizeText(plan.nombre) === normalizeText(planActual.nombre);

      return sameId || sameName;
    });

    return match?.id_plan ?? null;
  }, [planActual, planesList]);

  const handleSelectPlanEmpresa = async (plan) => {
    try {
      if (!plan) return;

      if (String(plan.id_plan) === String(currentPlanId)) {
        await Swal.fire({
          icon: "info",
          title: "Ya tienes este plan",
          text: "Ese es tu plan actual.",
        });
        return;
      }

      const confirm = await Swal.fire({
        icon: "question",
        title: `¿Cambiar a ${plan.nombre}?`,
        text: "Se actualizará el plan de tu empresa.",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;

      setLoadingChange(true);

      const result = await dispatch(cambiarPlanEmpresa(plan.id_plan));

      if (result?.meta?.requestStatus === "fulfilled") {
        await Swal.fire({
          icon: "success",
          title: "Plan actualizado",
          text: `Tu empresa ahora usa el plan ${plan.nombre}.`,
        });

        navigate("/admin-empresa");
      } else {
        throw new Error(result?.payload || "No se pudo cambiar el plan");
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || err || "No se pudo cambiar el plan",
      });
    } finally {
      setLoadingChange(false);
    }
  };

  return (
    <main className="planes-pagos">
      <section className="planes-pagos__hero">
        <span className="planes-pagos__eyebrow">
          {modo === "empresa" ? "Cambiar plan" : "Planes & Precios"}
        </span>

        <h1 className="planes-pagos__title">
          {modo === "empresa" ? (
            <>
              Elige el nuevo <span>plan de tu empresa</span>
            </>
          ) : (
            <>
              Elige el plan <span>que se adapta</span> a ti
            </>
          )}
        </h1>

        <p className="planes-pagos__subtitle">
          {modo === "empresa"
            ? "Selecciona un plan para actualizar las capacidades y límites de tu empresa."
            : "Consulta los planes disponibles, sus límites y funcionalidades incluidas."}
        </p>
      </section>

      {cargando && (
        <p className="planes-pagos__loading">Cargando planes…</p>
      )}

      {error && (
        <p className="planes-pagos__error">
          No se pudieron cargar los planes: {error}
        </p>
      )}

      {!cargando && !error && (
        <div className="planes-pagos__grid">
          {planesList.length > 0 ? (
            planesList.map((plan) => (
              <PlanCard
                key={plan.id_plan}
                plan={plan}
                modo={modo}
                currentPlanId={currentPlanId}
                loading={loadingChange}
                onSelectPlan={handleSelectPlanEmpresa}
              />
            ))
          ) : (
            <p className="planes-pagos__empty">
              No hay planes disponibles por el momento.
            </p>
          )}
        </div>
      )}

      {!cargando && !error && planesList.length > 0 && modo !== "empresa" && (
        <p className="planes-pagos__footer-note">
          ¿Necesitas algo a medida?{" "}
          <a href="mailto:contacto@tuempresa.com">
            Contáctanos
          </a>{" "}
          para un plan empresarial.
        </p>
      )}
    </main>
  );
}

export default PlanesPagos;