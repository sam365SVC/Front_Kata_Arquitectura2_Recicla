import { createAsyncThunk } from "@reduxjs/toolkit";
import { orchestrationApi } from "../../lib/api";

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

export const recibirOrdenYEnviarAInspeccionThunk = createAsyncThunk(
  "orchestration/recibirOrdenYEnviarAInspeccion",
  async ({ idOrden, payload = {} }, { rejectWithValue }) => {
    try {
      const response = await orchestrationApi.recibirYEnviarAInspeccion(
        idOrden,
        payload
      );
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);