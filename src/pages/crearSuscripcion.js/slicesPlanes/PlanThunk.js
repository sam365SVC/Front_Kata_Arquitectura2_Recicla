import { createAsyncThunk } from "@reduxjs/toolkit";
import { flagsApi } from "../../../lib/api";

const extractErrorMessage = (error) => {
  if (!error) return "Ocurrió un error inesperado";

  return (
    error.message ||
    error.msg ||
    error.data?.message ||
    error.data?.msg ||
    "Ocurrió un error inesperado"
  );
};

export const obtenerPlanesThunk = createAsyncThunk(
  "planes/obtenerPlanes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await flagsApi.obtenerPlanes();

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      if (Array.isArray(response)) {
        return response;
      }

      return [];
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);