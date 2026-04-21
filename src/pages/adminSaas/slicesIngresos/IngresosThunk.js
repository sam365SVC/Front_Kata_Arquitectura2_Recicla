import { createAsyncThunk } from "@reduxjs/toolkit";
import { pagoApi } from "../../../lib/api";

export const fetchSuscripciones = createAsyncThunk(
  "ingresos/fetchSuscripciones",
  async (_, { rejectWithValue }) => {
    try {
      const response = await pagoApi.fetchSuscripciones();

      return response?.suscripciones || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar las suscripciones"
      );
    }
  }
);