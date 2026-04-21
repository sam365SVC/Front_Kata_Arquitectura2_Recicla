import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../../lib/api";

const normalizeText = (value) => String(value || "").trim();

export const registrarClienteThunk = createAsyncThunk(
  "registro/registrarCliente",
  async (payload, { rejectWithValue }) => {
    try {
      const body = {
        nombre: normalizeText(payload?.nombre),
        apellido: normalizeText(payload?.apellido),
        email: normalizeText(payload?.email).toLowerCase(),
        telefono: normalizeText(payload?.telefono),
        direccion: normalizeText(payload?.direccion),
        password: normalizeText(payload?.password),
        tenant_id: 6, // ID de tenant fijo para clientes registrados desde esta página
      };

      const response = await authApi.registrarCliente(body);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo completar el registro del cliente."
      );
    }
  }
);

export const registrarTenantThunk = createAsyncThunk(
  "registro/registrarTenant",
  async (payload, { rejectWithValue }) => {
    try {
      const body = {
        nombre_empresa: normalizeText(payload?.nombre_empresa),
        email_contacto: normalizeText(payload?.email_contacto).toLowerCase(),
        telefono: normalizeText(payload?.telefono),
        nombre: normalizeText(payload?.nombre),
        apellido: normalizeText(payload?.apellido),
        email: normalizeText(payload?.email).toLowerCase(),
        password: normalizeText(payload?.password),
        plan: "Free", // Plan fijo para nuevos tenants registrados desde esta página
      };

      const response = await authApi.registrarTenantConPlan(body);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo completar el registro de la empresa."
      );
    }
  }
);