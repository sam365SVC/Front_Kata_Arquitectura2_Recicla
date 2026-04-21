import axios from "axios";
import { store } from "../store/index";

const API_BASE = "http://localhost:3000/api";
const METODO_TRANSFERENCIA = "TRANSFERENCIA";

const normalizarMetodoPago = (metodo) => {
  const valor = String(metodo || "").trim().toUpperCase();
  if (valor === "TRANSFERENCIA") return METODO_TRANSFERENCIA;
  return valor;
};

// =========================
// FACTORY
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
// CLIENTES BASE
// =========================
export const apiAuth = createApi("/auth");
export const apiCore = createApi("/core");
export const apiLogistics = createApi("/logistics");
export const apiFlags = createApi("/flags");
export const apiOrchestration = createApi("/orchestration");
export const apiAdmin = createApi("/admin");
export const apiPagos = createApi("/pagos");
export const apiInternal = createApi("/internal");

// default temporal para módulos viejos
const api = apiLogistics;
export default api;

// =========================
// AUTH
// =========================
export const authApi = {
  login: (data) =>
    apiAuth.post("/login", data).then((res) => res.data).catch(handleError),

  renew: () =>
    apiAuth.get("/renew").then((res) => res.data).catch(handleError),

  registrarTenantConPlan: (data) =>
    apiAuth
      .post("/register-tenant-with-plan", data)
      .then((res) => res.data)
      .catch(handleError),

  registrarTenant: (data) =>
    apiAuth
      .post("/registro/tenant", data)
      .then((res) => res.data)
      .catch(handleError),

  registrarCliente: (data) =>
    apiAuth
      .post("/registro/cliente", data)
      .then((res) => res.data)
      .catch(handleError),

  actualizarPlanTenant: (id, data) =>
    apiAuth
      .put(`/${id}/plan`, data)
      .then((res) => res.data)
      .catch(handleError),

  activarUsuarioEmpresa: (data) =>
    apiAuth
      .post("/empleados/activar", data)
      .then((res) => res.data)
      .catch(handleError),

  getAllTenants: (params = {}) =>
    apiAuth
      .get("/tenants", { params })
      .then((res) => res.data)
      .catch(handleError),
};

// alias viejo
export const loginApi = authApi;

// =========================
// LOGISTICS
// =========================
export const ordenesApi = {
  fetchOrdenes: (params = {}) =>
    apiLogistics
      .get("/ordenes", { params })
      .then((res) => res.data)
      .catch(handleError),

  fetchOrdenById: (id) =>
    apiLogistics
      .get(`/ordenes/${id}`)
      .then((res) => res.data)
      .catch(handleError),

  createOrden: (data) =>
    apiLogistics
      .post("/ordenes", data)
      .then((res) => res.data)
      .catch(handleError),

  updateOrden: (id, data) =>
    apiLogistics
      .put(`/ordenes/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),

  patchOrden: (id, data) =>
    apiLogistics
      .patch(`/ordenes/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),

  changeEstado: (id, data) =>
    apiLogistics
      .patch(`/ordenes/${id}/estado`, data)
      .then((res) => res.data)
      .catch(handleError),
};

export const conductoresApi = {
  fetchConductores: (params = {}) =>
    apiLogistics
      .get("/conductores", { params })
      .then((res) => res.data)
      .catch(handleError),

  fetchConductorById: (id) =>
    apiLogistics
      .get(`/conductores/${id}`)
      .then((res) => res.data)
      .catch(handleError),

  createConductor: (data) =>
    apiLogistics
      .post("/conductores", data)
      .then((res) => res.data)
      .catch(handleError),

  updateConductor: (id, data) =>
    apiLogistics
      .put(`/conductores/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),

  patchConductor: (id, data) =>
    apiLogistics
      .patch(`/conductores/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),

  deleteConductor: (id) =>
    apiLogistics
      .delete(`/conductores/${id}`)
      .then((res) => res.data)
      .catch(handleError),
};

export const despachoApi = {
  asignarConductor: (idOrden, data) =>
    apiLogistics
      .patch(`/despacho/ordenes/${idOrden}/asignar`, data)
      .then((res) => res.data)
      .catch(handleError),

  recalcularRuta: (idOrden) =>
    apiLogistics
      .post(`/despacho/ordenes/${idOrden}/recalcular-ruta`)
      .then((res) => res.data)
      .catch(handleError),
};

export const ubicacionesApi = {
  fetchUbicaciones: (idOrden) =>
    apiLogistics
      .get(`/ubicaciones/orden/${idOrden}`)
      .then((res) => res.data)
      .catch(handleError),

  fetchByOrdenId: (idOrden) =>
    apiLogistics
      .get(`/ubicaciones/orden/${idOrden}`)
      .then((res) => res.data)
      .catch(handleError),
};

// =========================
// CORE
// =========================
export const cotizacionesApi = {
  fetchCotizaciones: (params = {}) =>
    apiCore
      .get("/solicitudes-cotizacion", { params })
      .then((res) => res.data)
      .catch(handleError),

  fetchCotizacionesByClienteId: (tenantId, clienteId) =>
    apiCore
      .get("/solicitudes-cotizacion", { params: { tenantId, clienteId } })
      .then((res) => res.data)
      .catch(handleError),

  fetchById: (id) =>
    apiCore
      .get(`/solicitudes-cotizacion/${id}`)
      .then((res) => res.data)
      .catch(handleError),

  fetchCotizacionById: (id) =>
    apiCore
      .get(`/solicitudes-cotizacion/${id}`)
      .then((res) => res.data)
      .catch(handleError),

  crearSolicitud: (data) =>
    apiCore
      .post("/solicitudes-cotizacion", data)
      .then((res) => res.data)
      .catch(handleError),

  crearSolicitudCotizacion: (data) =>
    apiCore
      .post("/solicitudes-cotizacion", data)
      .then((res) => res.data)
      .catch(handleError),

  aceptar: (id, data) =>
    apiCore
      .patch(`/solicitudes-cotizacion/${id}/aceptar`, data)
      .then((res) => res.data)
      .catch(handleError),

  aceptarCotizacionInicial: (idSolicitud, usuario) =>
    apiCore
      .patch(`/solicitudes-cotizacion/${idSolicitud}/aceptar`, { usuario })
      .then((res) => res.data)
      .catch(handleError),

  rechazarCotizacionInicial: (idSolicitud, estado) =>
    apiCore
      .patch(`/solicitudes-cotizacion/${idSolicitud}/estado`, { estado })
      .then((res) => res.data)
      .catch(handleError),
};

export const inspeccionesApi = {
  fetchInspecciones: (params = {}) =>
    apiCore
      .get("/inspecciones", { params })
      .then((res) => res.data)
      .catch(handleError),

  fetchInspeccionesByInspectorId: (tenantId, inspectorId) =>
    apiCore
      .get("/inspecciones", { params: { tenantId, inspectorId } })
      .then((res) => res.data)
      .catch(handleError),

  fetchInspeccionById: (id) =>
    apiCore
      .get(`/inspecciones/${id}`)
      .then((res) => res.data)
      .catch(handleError),

  iniciar: (data) =>
    apiCore
      .post("/inspecciones", data)
      .then((res) => res.data)
      .catch(handleError),

  iniciarInspeccion: (data) =>
    apiCore
      .post("/inspecciones", data)
      .then((res) => res.data)
      .catch(handleError),

  completar: (id, data) =>
    apiCore
      .put(`/inspecciones/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),

  completarInspeccion: (id, data) =>
    apiCore
      .put(`/inspecciones/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),

  observarInspeccion: (id, data) =>
    apiCore
      .post(`/inspecciones/observar/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),
};

// =========================
// EMPRESA / AUTH
// =========================
export const empresasApi = {
  fetchUsuarios: (params = {}) =>
    apiAuth
      .get("/usuarios", { params })
      .then((res) => res.data)
      .catch(handleError),

  fetchUsuariosEmpresaByTenantId: () =>
    apiAuth.get("/usuarios").then((res) => res.data).catch(handleError),

  createUsuario: (data) =>
    apiAuth
      .post("/empleados/invitar", data)
      .then((res) => res.data)
      .catch(handleError),

  createUsuarioEmpresa: (data) =>
    apiAuth
      .post("/empleados/invitar", data)
      .then((res) => res.data)
      .catch(handleError),

  activarUsuarioEmpresa: (data) =>
    apiAuth
      .post("/empleados/activar", data)
      .then((res) => res.data)
      .catch(handleError),

  updateUsuarioEmpresa: (id, data) =>
    apiAuth
      .put(`/usuarios/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),

  changeEstadoUsuarioEmpresa: (id) =>
    apiAuth
      .patch(`/usuarios/${id}`)
      .then((res) => res.data)
      .catch(handleError),
};

// =========================
// TIPOS DE DISPOSITIVO
// =========================
export const tipoDispositivoApi = {
  fetchTiposByTenantId: (tenantId) =>
    apiCore
      .get("/tipos-dispositivo", { params: { tenantId, activo: true } })
      .then((res) => res.data)
      .catch(handleError),

  fetchTiposDispositivoEmpresaByTenantId: (tenantId, params = {}) =>
    apiCore
      .get("/tipos-dispositivo", { params: { tenantId, ...params } })
      .then((res) => res.data)
      .catch(handleError),

  fetchTipoDispositivoEmpresaById: (id) =>
    apiCore
      .get(`/tipos-dispositivo/${id}`)
      .then((res) => res.data)
      .catch(handleError),

  createTipoDispositivoEmpresa: (data) =>
    apiCore
      .post("/tipos-dispositivo", data)
      .then((res) => res.data)
      .catch(handleError),

  updateTipoDispositivoEmpresa: (id, data) =>
    apiCore
      .put(`/tipos-dispositivo/${id}`, data)
      .then((res) => res.data)
      .catch(handleError),

  changeEstadoTipoDispositivoEmpresa: (id, data) =>
    apiCore
      .patch(`/tipos-dispositivo/${id}/estado`, data)
      .then((res) => res.data)
      .catch(handleError),
};

export const tiposDispositivoApi = tipoDispositivoApi;

// =========================
// FLAGS
// =========================
export const flagsApi = {
  fetchFlags: (tenantId) =>
    apiFlags.get(`/${tenantId}`).then((res) => res.data).catch(handleError),

  verificarPermiso: (tenantId, accion) =>
    apiFlags
      .post(`/${tenantId}/verificar`, { accion })
      .then((res) => res.data)
      .catch(handleError),

  invalidarCache: (tenantId) =>
    apiFlags
      .delete(`/${tenantId}/cache`)
      .then((res) => res.data)
      .catch(handleError),

  cambiarPlan: (tenantId, data) =>
    apiFlags
      .put(`/${tenantId}/plan`, data)
      .then((res) => res.data)
      .catch(handleError),

  actualizarUso: (tenantId, data) =>
    apiFlags
      .post(`/${tenantId}/uso`, data)
      .then((res) => res.data)
      .catch(handleError),

  obtenerPlanes: () =>
    apiFlags.get("/planes").then((res) => res.data).catch(handleError),
};

// =========================
// PAGOS / BILLING
// =========================
export const pagoApi = {
  fetchPagos: () =>
    apiPagos.get("/pagos").then((res) => res.data).catch(handleError),

  fetchPagoById: (id) =>
    apiPagos.get(`/pagos/${id}`).then((res) => res.data).catch(handleError),

  createPago: (data) =>
    apiPagos
      .post("/pagos/new", {
        ...data,
        metodo: normalizarMetodoPago(data?.metodo),
      })
      .then((res) => res.data)
      .catch(handleError),

  confirmarSuscripcionId: (idSuscripcion) =>
    apiPagos
      .get(`/suscripciones/${idSuscripcion}`)
      .then((res) => res.data)
      .catch(handleError),

  confirmarPagoSuscripcion: (idSuscripcion, data) =>
    apiPagos
      .put(`/suscripciones/${idSuscripcion}`, data)
      .then((res) => res.data)
      .catch(handleError),

  createSuscripcion: (data) =>
  apiPagos
    .post("/suscripciones/new", {
      user_id: data.user_id,
      servicio_id: data.servicio_id,
      meses: data.meses,
      precio_unitario: data.precio_unitario,
      moneda: data.moneda,
      nombre_plan: data.nombre_plan,
      force: data.force ?? true,
    })
    .then((res) => res.data)
    .catch(handleError),

  createFacturaRecibo: (data) =>
    apiPagos
      .post("/factura-recibo/new", {
        pago_id_pago: data.pago_id_pago,
        tipo: data.tipo,
        numero: data.numero,
        razon_social: data.razon_social,
        nit_ci: data.nit_ci,
      })
      .then((res) => res.data)
      .catch(handleError),

  confirmarPagoPorSuscripcion: (idSuscripcion, data) =>
    apiPagos
      .put(`/pagos/confirmar/suscripcion/${idSuscripcion}`, {
        tipo: data.tipo,
        razon_social: data.razon_social,
        nit_ci: data.nit_ci,
      })
      .then((res) => res.data)
      .catch(handleError),
};

export const qrApi = {
  generarQR: (data) =>
    apiPagos.post("/qr/generar", data).then((res) => res.data).catch(handleError),

  verificarPagoQR: (data) =>
    apiPagos.post("/qr/verificar", data).then((res) => res.data).catch(handleError),
};

export const certificadosApi = {
  enviarCertificadoPorMatricula: (idMatricula) =>
    apiPagos
      .post("/certificados/enviar", { id_matricula: idMatricula })
      .then((res) => res.data)
      .catch(handleError),
};
export const comprobantesApi = {
  enviarComprobantePorPago: ({ idSuscripcionPago, email }) =>
    apiPagos
      .post("/comprobantes/enviar", {
        id_suscripcion_pago: idSuscripcionPago,
        user_email: email,
      })
      .then((res) => res.data)
      .catch(handleError),
};
// =========================
// ORCHESTRATION
// =========================
export const orchestrationApi = {
  aceptarYCrearLogistica: (idSolicitud, data = {}) =>
    apiOrchestration
      .patch(
        `/solicitudes-cotizacion/${idSolicitud}/aceptar-y-crear-logistica`,
        data
      )
      .then((res) => res.data)
      .catch(handleError),
};

// =========================
// ADMIN
// =========================
export const adminApi = {
  cambiarPlanTenant: (tenantId, data) =>
    apiAdmin
      .put(`/tenants/${tenantId}/plan`, data)
      .then((res) => res.data)
      .catch(handleError),
};
export const internalApi = {
  cambiarPlanTenant: (tenantId, data) =>
    apiInternal
      .put(`/admin/tenants/${tenantId}/plan`, data)
      .then((res) => res.data)
      .catch(handleError),
};