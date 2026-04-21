import { createAsyncThunk } from "@reduxjs/toolkit";
import { reportesApi } from "../../../lib/reportesApi";

// ─── Helper: obtener tenantId desde el state ──────────────────────────────────

const getTenantIdFromState = (state) =>
  state?.login?.user?.tenantId ||
  state?.login?.tenantId ||
  null;

// ─── Thunk: cargar resumen de cotizaciones ────────────────────────────────────

export const fetchResumenCotizaciones = createAsyncThunk(
  "reportes/fetchResumenCotizaciones",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const tenantId = getTenantIdFromState(state);

      if (!tenantId) {
        throw new Error("No se encontró el tenant actual.");
      }

      const resumen = await reportesApi.fetchResumen(tenantId);
      return resumen;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo cargar el resumen de cotizaciones"
      );
    }
  }
);

// ─── Thunk: cargar dispositivos más cotizados ─────────────────────────────────

export const fetchDispositivosMasCotizados = createAsyncThunk(
  "reportes/fetchDispositivosMasCotizados",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const tenantId = getTenantIdFromState(state);

      if (!tenantId) {
        throw new Error("No se encontró el tenant actual.");
      }

      const dispositivos = await reportesApi.fetchDispositivosMasCotizados(tenantId);
      return dispositivos;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudieron cargar los dispositivos"
      );
    }
  }
);

// ─── Thunk: cargar ambos datos en paralelo ────────────────────────────────────

export const fetchDatosReportes = createAsyncThunk(
  "reportes/fetchDatosReportes",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const tenantId = getTenantIdFromState(state);

      if (!tenantId) {
        throw new Error("No se encontró el tenant actual.");
      }

      const [resumen, dispositivos] = await Promise.all([
        reportesApi.fetchResumen(tenantId),
        reportesApi.fetchDispositivosMasCotizados(tenantId),
      ]);

      return { resumen, dispositivos };
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudieron cargar los datos del reporte"
      );
    }
  }
);

// ─── Thunk: generar reporte (PDF o Excel) ─────────────────────────────────────

export const generarReporte = createAsyncThunk(
  "reportes/generarReporte",
  async ({ mutation, fechaDesde, fechaHasta }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const tenantId = getTenantIdFromState(state);

      if (!tenantId) {
        throw new Error("No se encontró el tenant actual.");
      }

      const resultado = await reportesApi.generarReporte(mutation, {
        tenantId,
        fechaDesde,
        fechaHasta,
      });

      return resultado;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo generar el reporte"
      );
    }
  }
);
