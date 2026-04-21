import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../../lib/api";

export const fetchAllTenants = createAsyncThunk(
  "tenants/fetchAllTenants",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await authApi.getAllTenants(params);
      console.log("response thunk:", response);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo cargar la lista de empresas."
      );
    }
  }
);