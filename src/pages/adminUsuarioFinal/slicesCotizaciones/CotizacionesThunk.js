import { createAsyncThunk } from "@reduxjs/toolkit";
import { cotizacionesApi } from "../../../lib/api";
import { fetchCarritoByUsuarioId } from "../../adminEstudiantes/slicesCarrito/CarritoThunk";

export const fetchCotizacionesByClienteId = createAsyncThunk(
    'cotizaciones/fetchCotizacionesByClienteId',
    async (tenantId, clienteId, { rejectWithValue }) => {
        try {
            const response = await cotizacionesApi.fetchCotizacionesByClienteId(tenantId, clienteId);
            return response || [];
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
    'cotizaciones/aceptarCotizacionInicial',
    async (solicitudId, usuario, { rejectWithValue }) => {
        try {
            const response = await cotizacionesApi.aceptar(solicitudId, usuario);
            return response;
        }
        catch (error) {
            return rejectWithValue(
                error?.response?.data || error?.message || error
            );
        }
    }
);
