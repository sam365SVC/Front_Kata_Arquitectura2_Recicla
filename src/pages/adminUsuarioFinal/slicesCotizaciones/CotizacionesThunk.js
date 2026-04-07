import { createAsyncThunk } from "@reduxjs/toolkit";
import { cotizacionesApi } from "../../../lib/api";

export const fetchCotizacionesByClienteId = createAsyncThunk(
  "cotizaciones/fetchCotizacionesByClienteId",
  async ({ tenantId, clienteId }, { rejectWithValue }) => {
    try {
      const response = await cotizacionesApi.fetchCotizacionesByClienteId(tenantId, clienteId);
      return response?.data || response || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);

export const fetchCotizacionById = createAsyncThunk(
    'cotizaciones/fetchCotizacionById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await cotizacionesApi.fetchCotizacionById(id);
            return response;
        }
        catch (error) {
            return rejectWithValue(
                error?.response?.data || error?.message || error
            );
        }
    }
);

export const crearSolicitudCotizacion = createAsyncThunk(
  "cotizaciones/crearSolicitudCotizacion",
  async ({ tenantId, cliente, tipoDispositivoId, datosEquipo }, { rejectWithValue }) => {
    try {
      const response = await cotizacionesApi.crearSolicitudCotizacion({
        tenantId,
        tipoDispositivoId,
        cliente,
        canal: "web",
        datosEquipo,
        usuario: "cliente",
      });

      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);

export const aceptarCotizacionInicial = createAsyncThunk(
  "cotizaciones/aceptarCotizacionInicial",
  async ({ solicitudId, usuario = "cliente" }, { rejectWithValue }) => {
    try {
      const response = await cotizacionesApi.aceptarCotizacionInicial(solicitudId, usuario);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);

export const rechazarCotizacionInicial = createAsyncThunk(
  "cotizaciones/rechazarCotizacionInicial",
  async ({ solicitudId, estado = "rechazada" }, { rejectWithValue }) => {
    try {
      const response = await cotizacionesApi.rechazarCotizacionInicial(solicitudId, estado);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || error
      );
    }
  }
);