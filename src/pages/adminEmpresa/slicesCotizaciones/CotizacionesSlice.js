import { createSlice } from "@reduxjs/toolkit";
import { fetchPagosByTenant } from "./CotizacionesThunk";

const initialState = {
  cotizaciones: [],
  loading: false,
  error: null,
};

const cotizacionPagosSlice = createSlice({
  name: "cotizacionPagos",
  initialState,
  reducers: {
    clearPagos: (state) => {
      state.pagos = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPagosByTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPagosByTenant.fulfilled, (state, action) => {
        state.loading = false;
        // Soporta { pagos: [] } o directamente []
        state.pagos = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? action.payload?.data ?? [];
      })
      .addCase(fetchPagosByTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al cargar pagos";
      });
  },
});

export const { clearPagos } = cotizacionPagosSlice.actions;

// ─── Selectores ───────────────────────────────────────────────────────────────
export const selectCotizaciones        = (state) => state.cotizacionPagos?.pagos   ?? [];
export const selectPagosLoading = (state) => state.cotizacionPagos?.loading ?? false;
export const selectPagosError   = (state) => state.cotizacionPagos?.error   ?? null;

export default cotizacionPagosSlice.reducer;
