import { createAsyncThunk } from "@reduxjs/toolkit";
import { tipoDispositivoApi } from "../../../lib/api";

export const fetchTiposDispositivoEmpresa = createAsyncThunk(
  "tiposDispositivoEmpresa/fetchTiposDispositivoEmpresa",
  async ({ tenantId, activo } = {}, { rejectWithValue }) => {
    try {
      const response = await tipoDispositivoApi.fetchTiposDispositivoEmpresaByTenantId(
        tenantId,
        activo !== undefined ? { activo } : {}
      );

      return {
        items: Array.isArray(response?.data) ? response.data : [],
        total: response?.total || 0,
        message: response?.message || "Tipos de dispositivo obtenidos correctamente",
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo obtener los tipos de dispositivo"
      );
    }
  }
);

export const fetchTipoDispositivoEmpresaById = createAsyncThunk(
  "tiposDispositivoEmpresa/fetchTipoDispositivoEmpresaById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await tipoDispositivoApi.fetchTipoDispositivoEmpresaById(id);

      return response?.data || null;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo obtener el tipo de dispositivo"
      );
    }
  }
);

export const createTipoDispositivoEmpresa = createAsyncThunk(
  "tiposDispositivoEmpresa/createTipoDispositivoEmpresa",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await tipoDispositivoApi.createTipoDispositivoEmpresa(payload);

      return {
        item: response?.data || null,
        message: response?.message || "Tipo de dispositivo creado correctamente",
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo crear el tipo de dispositivo"
      );
    }
  }
);

export const updateTipoDispositivoEmpresa = createAsyncThunk(
  "tiposDispositivoEmpresa/updateTipoDispositivoEmpresa",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tipoDispositivoApi.updateTipoDispositivoEmpresa(id, data);

      return {
        item: response?.data || null,
        message: response?.message || "Tipo de dispositivo actualizado correctamente",
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo actualizar el tipo de dispositivo"
      );
    }
  }
);

export const changeEstadoTipoDispositivoEmpresa = createAsyncThunk(
  "tiposDispositivoEmpresa/changeEstadoTipoDispositivoEmpresa",
  async ({ id, activo }, { rejectWithValue }) => {
    try {
      const response = await tipoDispositivoApi.changeEstadoTipoDispositivoEmpresa(id, {
        activo,
      });

      return {
        item: response?.data || null,
        message:
          response?.message ||
          `Tipo de dispositivo ${activo ? "activado" : "desactivado"} correctamente`,
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo cambiar el estado del tipo de dispositivo"
      );
    }
  }
);