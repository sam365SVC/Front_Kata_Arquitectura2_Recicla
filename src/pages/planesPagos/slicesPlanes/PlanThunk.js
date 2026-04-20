import { createAsyncThunk } from "@reduxjs/toolkit";
import { flagsApi } from "../../../lib/api";

const extractErrorMessage = (error) => {
  if (!error) return "Ocurrió un error inesperado";

  return (
    error.message ||
    error.msg ||
    error.data?.message ||
    error.data?.msg ||
    "Ocurrió un error inesperado"
  );
};

// =========================
// OBTENER FLAGS
// =========================
export const fetchFlagsThunk = createAsyncThunk(
  "flags/fetchFlags",
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await flagsApi.fetchFlags(tenantId);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// VERIFICAR PERMISO
// =========================
export const verificarPermisoThunk = createAsyncThunk(
  "flags/verificarPermiso",
  async ({ tenantId, accion }, { rejectWithValue }) => {
    try {
      const response = await flagsApi.verificarPermiso(tenantId, accion);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// INVALIDAR CACHE
// =========================
export const invalidarCacheThunk = createAsyncThunk(
  "flags/invalidarCache",
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await flagsApi.invalidarCache(tenantId);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// CAMBIAR PLAN
// =========================
export const cambiarPlanThunk = createAsyncThunk(
  "flags/cambiarPlan",
  async (
    { tenantId, nuevo_plan, ciclo_inicio, ciclo_fin },
    { rejectWithValue }
  ) => {
    try {
      const response = await flagsApi.cambiarPlan(tenantId, {
        nuevo_plan,
        ciclo_inicio,
        ciclo_fin,
      });

      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// ACTUALIZAR USO
// =========================
export const actualizarUsoThunk = createAsyncThunk(
  "flags/actualizarUso",
  async ({ tenantId, campo, cantidad }, { rejectWithValue }) => {
    try {
      const response = await flagsApi.actualizarUso(tenantId, {
        campo,
        cantidad,
      });

      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);
// =========================
// OBTENER PLANES
// =========================
export const obtenerPlanesThunk = createAsyncThunk(
  "flags/obtenerPlanes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await flagsApi.obtenerPlanes();
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);