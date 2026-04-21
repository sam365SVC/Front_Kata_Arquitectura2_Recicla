import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDatosReportes,
  fetchResumenCotizaciones,
  fetchDispositivosMasCotizados,
  generarReporte,
} from "./ReportesThunk";

const initialState = {
  resumen: null,
  dispositivos: [],
  ultimoReporte: null,
  loading: false,
  loadingReporte: false,
  error: null,
  errorReporte: null,
};

const reportesSlice = createSlice({
  name: "reportes",
  initialState,
  reducers: {
    clearReportesError: (state) => {
      state.error = null;
    },
    clearErrorReporte: (state) => {
      state.errorReporte = null;
    },
    clearUltimoReporte: (state) => {
      state.ultimoReporte = null;
    },
    resetReportesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── DATOS COMBINADOS ──────────────────────────────────────────────────
      .addCase(fetchDatosReportes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatosReportes.fulfilled, (state, action) => {
        state.loading = false;
        state.resumen = action.payload.resumen || null;
        state.dispositivos = Array.isArray(action.payload.dispositivos)
          ? action.payload.dispositivos
          : [];
      })
      .addCase(fetchDatosReportes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudieron cargar los datos";
      })

      // ── RESUMEN ───────────────────────────────────────────────────────────
      .addCase(fetchResumenCotizaciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResumenCotizaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.resumen = action.payload || null;
      })
      .addCase(fetchResumenCotizaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudo obtener el resumen";
      })

      // ── DISPOSITIVOS ──────────────────────────────────────────────────────
      .addCase(fetchDispositivosMasCotizados.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispositivosMasCotizados.fulfilled, (state, action) => {
        state.loading = false;
        state.dispositivos = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDispositivosMasCotizados.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudieron obtener los dispositivos";
      })

      // ── GENERAR REPORTE ───────────────────────────────────────────────────
      .addCase(generarReporte.pending, (state) => {
        state.loadingReporte = true;
        state.errorReporte = null;
      })
      .addCase(generarReporte.fulfilled, (state, action) => {
        state.loadingReporte = false;
        state.ultimoReporte = action.payload || null;
      })
      .addCase(generarReporte.rejected, (state, action) => {
        state.loadingReporte = false;
        state.errorReporte = action.payload || "No se pudo generar el reporte";
      });
  },
});

export const {
  clearReportesError,
  clearErrorReporte,
  clearUltimoReporte,
  resetReportesState,
} = reportesSlice.actions;

// ─── Selectores ───────────────────────────────────────────────────────────────
export const selectResumen = (state) => state.reportes.resumen;
export const selectDispositivos = (state) => state.reportes.dispositivos;
export const selectUltimoReporte = (state) => state.reportes.ultimoReporte;
export const selectReportesLoading = (state) => state.reportes.loading;
export const selectLoadingReporte = (state) => state.reportes.loadingReporte;
export const selectReportesError = (state) => state.reportes.error;
export const selectErrorReporte = (state) => state.reportes.errorReporte;

export default reportesSlice.reducer;
