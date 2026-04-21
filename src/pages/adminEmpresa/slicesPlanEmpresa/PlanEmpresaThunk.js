import { createAsyncThunk } from "@reduxjs/toolkit";
import { flagsApi, adminApi } from "../../../lib/api";

const normalizeText = (value) => String(value || "").trim();

const getTenantIdFromState = (state) =>
  state?.login?.user?.tenantId ||
  state?.login?.tenantId ||
  null;

const capitalizeReportType = (value) => {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) return "No definido";
  if (raw === "ninguno") return "Ninguno";
  if (raw === "basico") return "Básicos";
  if (raw === "avanzado") return "Avanzados";
  if (raw === "personalizado") return "Personalizados";

  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const formatMesesHistorial = (value) => {
  if (value === null || value === undefined || value === "") {
    return "No definido";
  }

  if (String(value).toLowerCase() === "ilimitado") {
    return "Ilimitado";
  }

  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  return `${num} ${num === 1 ? "mes" : "meses"}`;
};

const mapPlanActual = (response) => {
  const payload = response?.data || response || null;
  if (!payload) return null;

  const limites = payload?.limites || {};
  const usoActual = payload?.uso_actual || {};
  const fechas = payload?.fechas || {};

  const planNombre = payload?.plan || "Sin plan";

  return {
    id: normalizeText(planNombre).toLowerCase(),
    nombre: planNombre,
    precio: payload?.precio ?? null,
    moneda: "Bs.",
    estado: "Activo",
    renovacion: fechas?.ciclo_fin || fechas?.expira_en || null,
    metodoPago: "No definido",

    dispositivos: limites?.max_dispositivos ?? null,
    reglas: limites?.max_reglas ?? null,
    inspectores: limites?.max_inspectores ?? null,
    cotizacionesMes: limites?.max_cotizaciones_mes ?? null,
    historial: formatMesesHistorial(limites?.meses_historial),
    reportes: capitalizeReportType(limites?.tipo_reportes),
    puedeExportar: Boolean(limites?.puede_exportar),

    raw: payload,
    usoActual: {
      dispositivos: usoActual?.dispositivos_count ?? 0,
      reglas: usoActual?.reglas_count ?? 0,
      inspectores: usoActual?.inspectores_count ?? 0,
      cotizaciones: usoActual?.cotizaciones_usadas ?? 0,
    },
  };
};

const mapPlanDisponible = (plan) => ({
  id:
    plan?.id_plan ||
    plan?.id ||
    normalizeText(plan?.nombre).toLowerCase(),
  nombre: plan?.nombre || "Sin nombre",
  precio: plan?.precio ?? null,
  moneda: "Bs.",
  dispositivos: plan?.max_dispositivos ?? null,
  reglas: plan?.max_reglas ?? null,
  inspectores: plan?.max_inspectores ?? null,
  cotizacionesMes: plan?.max_cotizaciones_mes ?? null,
  historial: formatMesesHistorial(plan?.meses_historial),
  reportes: capitalizeReportType(plan?.tipo_reportes),
  puedeExportar: Boolean(plan?.puede_exportar),
  destacado: false,
  raw: plan,
});

const getTodayAndNextYear = () => {
  const today = new Date();

  const inicio = today.toISOString().slice(0, 10);

  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const fin = nextYear.toISOString().slice(0, 10);

  return { inicio, fin };
};

export const fetchPlanEmpresa = createAsyncThunk(
  "planEmpresa/fetchPlanEmpresa",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const tenantId = getTenantIdFromState(state);

      if (!tenantId) {
        throw new Error("No se encontró el tenant actual.");
      }

      const response = await flagsApi.fetchFlags(tenantId);
      return mapPlanActual(response);
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo cargar el plan actual"
      );
    }
  }
);

export const fetchPlanesDisponibles = createAsyncThunk(
  "planEmpresa/fetchPlanesDisponibles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await flagsApi.obtenerPlanes();

      const planes = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      return planes.map(mapPlanDisponible);
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudieron cargar los planes disponibles"
      );
    }
  }
);

export const cambiarPlanEmpresa = createAsyncThunk(
  "planEmpresa/cambiarPlanEmpresa",
  async (planId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const tenantId = getTenantIdFromState(state);

      if (!tenantId) {
        throw new Error("No se encontró el tenant actual.");
      }

      const planesResponse = await flagsApi.obtenerPlanes();

      const planes = Array.isArray(planesResponse?.data)
        ? planesResponse.data
        : Array.isArray(planesResponse)
        ? planesResponse
        : [];

      const planSeleccionado = planes.find((plan) => {
        const id =
          plan?.id_plan ||
          plan?.id ||
          normalizeText(plan?.nombre).toLowerCase();

        return String(id) === String(planId);
      });

      if (!planSeleccionado) {
        throw new Error("No se encontró el plan seleccionado");
      }

      const { inicio, fin } = getTodayAndNextYear();

      const payload = {
        nuevo_plan: planSeleccionado?.nombre,
        ciclo_inicio: inicio,
        ciclo_fin: fin,
        forzar: true,
      };

      await adminApi.cambiarPlanTenant(tenantId, payload);

      const planActualizadoResponse = await flagsApi.fetchFlags(tenantId);

      return {
        message: `Tu plan fue actualizado a ${planSeleccionado?.nombre}`,
        planActual: mapPlanActual(planActualizadoResponse),
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudo cambiar el plan"
      );
    }
  }
);