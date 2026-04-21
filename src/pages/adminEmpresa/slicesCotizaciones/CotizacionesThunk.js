import { createAsyncThunk } from "@reduxjs/toolkit";
import { cotizacionesApi } from "../../../lib/api";

const getTenantIdFromState = (state) =>
  state?.login?.user?.tenantId ||
  state?.login?.tenantId ||
  null;

export const fetchPagosByTenant = createAsyncThunk(
  "cotizacionPagos/fetchPagosByTenant",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const tenantId = getTenantIdFromState(state);

      if (!tenantId) {
        throw new Error("No se encontró el tenant actual.");
      }

      const data = await cotizacionesApi.fetchCotizacionesByTenantId(tenantId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudieron cargar las cotizaciones"
      );
    }
  }
);