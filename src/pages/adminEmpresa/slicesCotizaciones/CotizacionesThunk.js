import { createAsyncThunk } from "@reduxjs/toolkit";
import { cotizacionesApi } from "../../../lib/api"; // ajusta la ruta a tu api.js

// ─── Helper: mismo patrón que reportesThunk ───────────────────────────────────
const getTenantIdFromState = (state) =>
  state?.login?.user?.tenantId ||
  state?.login?.tenantId       ||
  null;

// ─── Thunk: cargar pagos/cotizaciones-pago del tenant ─────────────────────────
export const fetchPagosByTenant = createAsyncThunk(
  "cotizacionPagos/fetchPagosByTenant",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state    = getState();
      const tenantId = getTenantIdFromState(state);

      if (!tenantId) {
        throw new Error("No se encontró el tenant actual.");
      }
      console.log("tenantId ",tenantId);
      const data = await cotizacionesApi.fetchCotizacionesByTenantId(tenantId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudieron cargar los pagos"
      );
    }
  }
);
