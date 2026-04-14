import { createSlice } from "@reduxjs/toolkit";
import {
  fetchInspeccionesByInspectorId,
  fetchInspeccionById,
  iniciarInspeccion,
  completarInspeccion,
  observarInspeccion,
} from "./InspeccionesThunk";

const initialState = {
  inspecciones:      [],
  inspeccionesById:  {},
  totalItems:        0,
  totalPages:        1,
  currentPage:       1,
  isLoading:         false,
  error:             null,
  inspeccionIniciando:   false,  // equivalente a cotizacionesCreating
  inspeccionInicioError: null,
};

const InspeccionesSlice = createSlice({
  name: "inspecciones",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearInicioError(state) {
      state.inspeccionInicioError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── fetchInspeccionesByInspectorId ───────────────────────────────────
      .addCase(fetchInspeccionesByInspectorId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInspeccionesByInspectorId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inspecciones = action.payload || [];
      })
      .addCase(fetchInspeccionesByInspectorId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Error al cargar las inspecciones";
      })

      // ── fetchInspeccionById ──────────────────────────────────────────────
      .addCase(fetchInspeccionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInspeccionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inspeccionesById[action.payload._id] = action.payload;
      })
      .addCase(fetchInspeccionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Error al cargar la inspección";
      })

      // ── iniciarInspeccion (POST /inspecciones) ───────────────────────────
      .addCase(iniciarInspeccion.pending, (state) => {
        state.inspeccionIniciando = true;
        state.inspeccionInicioError = null;
      })
      .addCase(iniciarInspeccion.fulfilled, (state, action) => {
        state.inspeccionIniciando = false;
        state.inspecciones.push(action.payload);
      })
      .addCase(iniciarInspeccion.rejected, (state, action) => {
        state.inspeccionIniciando = false;
        state.inspeccionInicioError = action.payload || "Error al iniciar la inspección";
      })

      // ── completarInspeccion (PATCH /inspecciones/:id/estado) ─────────────
      .addCase(completarInspeccion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completarInspeccion.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.inspecciones.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) state.inspecciones[idx] = action.payload;
        // también actualiza el caché by-id si existe
        if (state.inspeccionesById[action.payload._id]) {
          state.inspeccionesById[action.payload._id] = action.payload;
        }
      })
      .addCase(completarInspeccion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Error al completar la inspección";
      })

      // ── observarInspeccion (POST /inspecciones/observar/:id) ─────────────
      .addCase(observarInspeccion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(observarInspeccion.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.inspecciones.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) state.inspecciones[idx] = action.payload;
      })
      .addCase(observarInspeccion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Error al registrar la observación";
      });
  },
});

export const { clearError, clearInicioError } = InspeccionesSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectInspecciones        = (state) => state.inspecciones.inspecciones || [];
export const selectInspeccionesLoading = (state) => state.inspecciones.isLoading;
export const selectInspeccionesError   = (state) => state.inspecciones.error;
export const selectInspeccionIniciando = (state) => state.inspecciones.inspeccionIniciando;
export const selectInspeccionInicioError = (state) => state.inspecciones.inspeccionInicioError;
export const selectInspeccionById      = (id) => (state) => state.inspecciones.inspeccionesById[id];
export const selectInspeccionesState   = (state) => state.inspecciones || initialState;

export default InspeccionesSlice.reducer;