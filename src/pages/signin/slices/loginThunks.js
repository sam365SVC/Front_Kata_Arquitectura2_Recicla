import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi } from "../../../lib/api";

function normalizeLoginResponse(res) {
  const ok = !!res?.ok;

  const id = res?.uid ?? null;
  const token = res?.token ?? null;

  const email = res?.email ?? "";
  const rol = res?.userRol ?? "";
  const nombres = res?.nombre ?? "";
  const apellido = res?.apellido ?? "";
  const nombre = [nombres, apellido].filter(Boolean).join(" ") || email.split("@")[0];
  const telefono = res?.telefono ?? "";


  const tenantId = res?.tenantId ?? null;
  const tenantNombre = res?.tenant_nombre ?? "";

  const expiresAt = res?.exp ? res.exp * 1000 : null;

  return {
    ok,
    id,
    mail: email,
    nombres: nombre|| "Usuario",
    telefono,
    rol,
    tenantId,
    tenantNombre,
    token,
    expiresAt,
  };
}

export const loginUser = createAsyncThunk(
  "login/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi.login(credentials);

      if (response?.seleccionar_tenant) {
        return {
          needsTenantSelection: true,
          tenants: response.tenants || [],
          pendingCredentials: {
            email: credentials?.email ?? "",
            password: credentials?.password ?? "",
          },
        };
      }

      const norm = normalizeLoginResponse(response);

      if (!norm.ok || !norm.token || !norm.id) {
        return rejectWithValue({
          message: response?.msg || "Credenciales inválidas o respuesta incompleta",
        });
      }

      return norm;
    } catch (error) {
      return rejectWithValue({
        message: error?.message || "No se pudo conectar con el servidor",
      });
    }
  }
);

export const renewSession = createAsyncThunk(
  "login/renewSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await loginApi.renew();
      const norm = normalizeLoginResponse(response);

      if (!norm.ok || !norm.token || !norm.id) {
        return rejectWithValue({
          message: "No se pudo renovar la sesión",
        });
      }

      return norm;
    } catch (error) {
      return rejectWithValue({
        message: error?.message || "Sesión expirada",
      });
    }
  }
);