import { createAsyncThunk } from "@reduxjs/toolkit";
import { pagoApi } from "../../../lib/api";

const extractErrorMessage = (error) => {
  if (!error) return "Ocurrió un error inesperado";

  return (
    error?.response?.data?.message ||
    error?.response?.data?.msg ||
    error?.data?.message ||
    error?.data?.msg ||
    error?.message ||
    error?.msg ||
    "Ocurrió un error inesperado"
  );
};

const normalizePlanName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const PLAN_ORDER = {
  free: 1,
  basic: 2,
  premium: 3,
  enterprise: 4,
};

const getPlanLevel = (planName) => {
  const normalized = normalizePlanName(planName);
  return PLAN_ORDER[normalized] || 0;
};

const isUpgradePlan = (currentPlanName, newPlanName) => {
  const currentLevel = getPlanLevel(currentPlanName);
  const newLevel = getPlanLevel(newPlanName);

  if (!currentLevel || !newLevel) return false;
  return newLevel > currentLevel;
};

const isSamePlan = (currentPlanName, newPlanName) =>
  normalizePlanName(currentPlanName) === normalizePlanName(newPlanName);

const getPlanActualFromState = (state) =>
  state?.planEmpresa?.planActual || null;

export const crearSuscripcionThunk = createAsyncThunk(
  "checkout/crearSuscripcion",
  async (
    {
      user_id,
      servicio_id,
      meses,
      precio_unitario,
      moneda = "BOB",
      nombre_plan,
      force = true,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await pagoApi.createSuscripcion({
        user_id,
        servicio_id,
        meses,
        precio_unitario,
        moneda,
        nombre_plan,
        force,
      });

      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);