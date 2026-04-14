import { createAsyncThunk } from "@reduxjs/toolkit";

const PLANES_MOCK = [
  {
    id: "free",
    nombre: "Free",
    precio: 0,
    dispositivos: 5,
    reglas: 10,
    inspectores: 1,
    historial: "Básico",
    reportes: "No",
    destacado: false,
  },
  {
    id: "basic",
    nombre: "Basic",
    precio: 99,
    dispositivos: 20,
    reglas: 20,
    inspectores: 3,
    historial: "6 meses",
    reportes: "Básicos",
    destacado: false,
  },
  {
    id: "premium",
    nombre: "Premium",
    precio: 299,
    dispositivos: 100,
    reglas: 100,
    inspectores: 15,
    historial: "2 años",
    reportes: "Avanzados",
    destacado: true,
  },
  {
    id: "enterprise",
    nombre: "Enterprise",
    precio: null,
    dispositivos: "Ilimitados",
    reglas: "Ilimitados",
    inspectores: "Ilimitados",
    historial: "Completo",
    reportes: "Avanzados",
    destacado: false,
  },
];

const PLAN_ACTUAL_MOCK = {
  id: "premium",
  nombre: "Premium",
  precio: 299,
  moneda: "Bs.",
  estado: "Activo",
  renovacion: "2026-05-15",
  metodoPago: "Tarjeta empresarial",
  dispositivos: 100,
  reglas: 100,
  inspectores: 15,
  historial: "2 años",
  reportes: "Avanzados",
};

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchPlanEmpresa = createAsyncThunk(
  "planEmpresa/fetchPlanEmpresa",
  async (_, { rejectWithValue }) => {
    try {
      await wait(250);
      return PLAN_ACTUAL_MOCK;
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
      await wait(250);
      return PLANES_MOCK;
    } catch (error) {
      return rejectWithValue(
        error?.message || "No se pudieron cargar los planes disponibles"
      );
    }
  }
);

export const cambiarPlanEmpresa = createAsyncThunk(
  "planEmpresa/cambiarPlanEmpresa",
  async (planId, { rejectWithValue }) => {
    try {
      await wait(700);

      const planSeleccionado = PLANES_MOCK.find((plan) => plan.id === planId);

      if (!planSeleccionado) {
        throw new Error("No se encontró el plan seleccionado");
      }

      return {
        message: `Tu plan fue actualizado a ${planSeleccionado.nombre}`,
        planActual: {
          ...planSeleccionado,
          moneda: "Bs.",
          estado: "Activo",
          renovacion: "2026-06-15",
          metodoPago: "Tarjeta empresarial",
        },
      };
    } catch (error) {
      return rejectWithValue(error?.message || "No se pudo cambiar el plan");
    }
  }
);