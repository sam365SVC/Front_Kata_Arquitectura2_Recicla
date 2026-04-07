import { createAsyncThunk } from "@reduxjs/toolkit";
import { tipoDispositivoApi } from "../../../lib/api";

export const fetchTiposDispositivo = createAsyncThunk(
  "tiposDispositivo/fetchTiposDispositivo",
  async ({ tenantId }, { rejectWithValue }) => {
    try {
      const response = await tipoDispositivoApi.fetchTiposByTenantId(tenantId);
      return response?.data || response || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);