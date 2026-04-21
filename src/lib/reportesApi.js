import axios from "axios";
import { store } from "../store/index";

const GQL_URL = "http://localhost:4009/graphql";
const API_BASE = "http://localhost:3000/api";

// =========================
// FACTORY REST (mismo patrón que el api.js de referencia)
// =========================
const createApi = (basePath) => {
  const instance = axios.create({
    baseURL: `${API_BASE}${basePath}`,
  });

  instance.interceptors.request.use((config) => {
    const state = store.getState();

    const token =
      state?.auth?.token ||
      state?.login?.token ||
      state?.login?.user?.token ||
      null;

    if (token) {
      config.headers["x-token"] = token;
    }

    config.headers["Content-Type"] =
      config.headers["Content-Type"] || "application/json";

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const errorData = {
          message:
            error.response.data?.msg ||
            error.response.data?.message ||
            "Error en la petición",
          status: error.response.status,
          data: error.response.data,
        };

        if (error.response.status === 401) {
          try {
            store.dispatch({ type: "auth/logout" });
          } catch (_) {}

          try {
            store.dispatch({ type: "login/logout" });
          } catch (_) {}
        }

        return Promise.reject(errorData);
      }

      if (error.request) {
        return Promise.reject({
          message: "No se pudo conectar con el servidor",
          status: 0,
        });
      }

      return Promise.reject({
        message: error.message || "Error desconocido",
        status: 0,
      });
    }
  );

  return instance;
};

const handleError = (error) => {
  throw error?.data || error || { message: "Error desconocido" };
};

// =========================
// INSTANCIAS
// =========================
export const apiReportes = createApi("/reportes");

// =========================
// CLIENTE GRAPHQL
// Usa fetch nativo pero con token desde el store
// =========================
const callGQL = async (query, variables = {}) => {
  const state = store.getState();
  const token =
    state?.auth?.token ||
    state?.login?.token ||
    state?.login?.user?.token ||
    null;

  const headers = { "Content-Type": "application/json" };
  if (token) headers["x-token"] = token;

  const res = await fetch(GQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);

  return json.data;
};

// =========================
// QUERIES GRAPHQL
// =========================
const Q_RESUMEN = `
  query ($tenantId: Int!) {
    resumenCotizaciones(filtro: { tenantId: $tenantId }) {
      total aceptadas pendientes rechazadas montoTotalFinal moneda
    }
  }
`;

const Q_DISPOSITIVOS = `
  query ($tenantId: Int!) {
    dispositivosMasCotizados(filtro: { tenantId: $tenantId }) {
      nombre totalSolicitudes montoPromedio
    }
  }
`;

const M_GENERAR = (mutation) => `
  mutation GenerarReporte($filtro: FiltroReporte!) {
    ${mutation}(filtro: $filtro) {
      fileName
      downloadUrl
      formato
      generadoEn
      metadata { totalRegistros tipoReporte }
    }
  }
`;

// =========================
// API DE REPORTES
// =========================
export const reportesApi = {
  /**
   * Obtiene el resumen de cotizaciones del tenant
   */
  fetchResumen: (tenantId) =>
    callGQL(Q_RESUMEN, { tenantId })
      .then((data) => data.resumenCotizaciones)
      .catch(handleError),

  /**
   * Obtiene los dispositivos más cotizados del tenant
   */
  fetchDispositivosMasCotizados: (tenantId) =>
    callGQL(Q_DISPOSITIVOS, { tenantId })
      .then((data) => data.dispositivosMasCotizados || [])
      .catch(handleError),

  /**
   * Genera un reporte (PDF o Excel) dado el nombre de la mutación y el filtro
   * @param {string} mutation - ej: "generarReporteFlujoExcel"
   * @param {{ tenantId: number, fechaDesde: string, fechaHasta: string }} filtro
   */
  generarReporte: (mutation, filtro) =>
    callGQL(M_GENERAR(mutation), { filtro })
      .then((data) => data[mutation])
      .catch(handleError),
};
