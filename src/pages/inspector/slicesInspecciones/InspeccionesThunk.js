import { createAsyncThunk } from "@reduxjs/toolkit";
import { inspeccionesApi } from "../../../lib/api";

// GET /inspecciones?tenantId=...&inspectorId=...
export const fetchInspeccionesByInspectorId = createAsyncThunk(
  "inspecciones/fetchInspeccionesByInspectorId",
  async ({ tenantId, inspectorId }, { rejectWithValue }) => {
    try {
      const response = await inspeccionesApi.fetchInspeccionesByInspectorId(tenantId, inspectorId);
      return response?.data || response || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);

// GET /inspecciones/:id
export const fetchInspeccionById = createAsyncThunk(
  "inspecciones/fetchInspeccionById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await inspeccionesApi.fetchInspeccionById(id);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);

// POST /inspecciones  →  crea / inicia la inspección
export const iniciarInspeccion = createAsyncThunk(
  "inspecciones/iniciarInspeccion",
  async (data, { rejectWithValue }) => {
    try {
      const response = await inspeccionesApi.iniciarInspeccion(data);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);

// PATCH /inspecciones/:id/estado  →  completa la inspección con checklist + condición
export const completarInspeccion = createAsyncThunk(
  "inspecciones/completarInspeccion",
  async ({ idInspeccion, data }, { rejectWithValue }) => {
    try {
      const response = await inspeccionesApi.completarInspeccion(idInspeccion, data);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);

// POST /inspecciones/observar/:id  →  agrega una observación sin cerrar la inspección
export const observarInspeccion = createAsyncThunk(
  "inspecciones/observarInspeccion",
  async ({ idInspeccion, ...data }, { rejectWithValue }) => {
    try {
      const response = await inspeccionesApi.observarInspeccion(idInspeccion, data);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);