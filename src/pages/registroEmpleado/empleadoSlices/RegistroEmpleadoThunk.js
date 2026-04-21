import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../../lib/api";

const normalizeText = (value) => String(value || "").trim();

export const activarUsuarioEmpresaThunk = createAsyncThunk(
  "activarEmpleado/activarUsuarioEmpresa",
  async (payload, { rejectWithValue }) => {
    try {
      const body = {
        token: normalizeText(payload?.token),
        password: normalizeText(payload?.password),
      };

      const response = await authApi.activarUsuarioEmpresa(body);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message ||
          error?.error?.message ||
          error?.data?.message ||
          "No se pudo activar la cuenta del empleado."
      );
    }
  }
);