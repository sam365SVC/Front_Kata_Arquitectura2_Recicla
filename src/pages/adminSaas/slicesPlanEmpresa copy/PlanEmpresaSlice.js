import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPlanEmpresa,
  fetchPlanesDisponibles,
  cambiarPlanEmpresa,
} from "./PlanEmpresaThunk";

const initialState = {
  planActual: null,
  planesDisponibles: [],
  loading: false,
  error: null,
  successMessage: null,
};

const planEmpresaSlice = createSlice({
  name: "planEmpresa",
  initialState,
  reducers: {
    clearPlanEmpresaError: (state) => {
      state.error = null;
    },

    clearPlanEmpresaSuccess: (state) => {
      state.successMessage = null;
    },

    resetPlanEmpresaState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // PLAN ACTUAL
      .addCase(fetchPlanEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanEmpresa.fulfilled, (state, action) => {
        state.loading = false;
        state.planActual = action.payload || null;
      })
      .addCase(fetchPlanEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudo obtener el plan actual";
      })

      // PLANES DISPONIBLES
      .addCase(fetchPlanesDisponibles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanesDisponibles.fulfilled, (state, action) => {
        state.loading = false;
        state.planesDisponibles = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchPlanesDisponibles.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "No se pudieron obtener los planes disponibles";
      })

      // CAMBIAR PLAN
      .addCase(cambiarPlanEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cambiarPlanEmpresa.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Plan actualizado correctamente";

        if (action.payload?.planActual) {
          state.planActual = action.payload.planActual;
        }
      })
      .addCase(cambiarPlanEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudo cambiar el plan";
      });
  },
});

export const {
  clearPlanEmpresaError,
  clearPlanEmpresaSuccess,
  resetPlanEmpresaState,
} = planEmpresaSlice.actions;

export const selectPlanEmpresa = (state) => state.planEmpresa.planActual;
export const selectPlanesDisponibles = (state) =>
  state.planEmpresa.planesDisponibles;
export const selectPlanEmpresaLoading = (state) => state.planEmpresa.loading;
export const selectPlanEmpresaError = (state) => state.planEmpresa.error;
export const selectPlanEmpresaSuccess = (state) =>
  state.planEmpresa.successMessage;

export default planEmpresaSlice.reducer;