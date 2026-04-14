import axios from 'axios';
import { store } from '../store/index';

const apiPagos = axios.create({
  baseURL: 'http://localhost:3001/api/',
});

const METODO_TRANSFERENCIA = 'TRANSFERENCIA';

const normalizarMetodoPago = (metodo) => {
  const valor = String(metodo || '').trim().toUpperCase();

  if (valor === 'TRANSFERENCIA') return METODO_TRANSFERENCIA;

  return valor;
};

// request interceptor
api.interceptors.request.use((config) => {
  const state = store.getState();
  const user = state?.login?.user;

  if (user?.token) {
    if (user.expiresAt && Date.now() > user.expiresAt) {
      store.dispatch({ type: 'login/logout' });
      return Promise.reject({
        message: 'Sesión expirada',
        status: 401,
      });
    }

    config.headers['x-token'] = user.token;
  }

  return config;
});

// response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorData = {
        message:
          error.response.data?.msg ||
          error.response.data?.message ||
          'Error en la petición',
        status: error.response.status,
        data: error.response.data,
      };

      if (error.response.status === 401) {
        store.dispatch({ type: 'login/logout' });
      }

      return Promise.reject(errorData);
    }

    if (error.request) {
      return Promise.reject({
        message: 'No se pudo conectar con el servidor',
        status: 0,
      });
    }

    return Promise.reject({
      message: error.message || 'Error desconocido',
      status: 0,
    });
  }
);

const handleError = (error) => {
  throw error?.data || error || { message: 'Error desconocido' };
};

export const pagoApi = {
  fetchPagos: () =>
    api.get('/pago').then((res) => res.data).catch(handleError),

  fetchPagoById: (id) =>
    api.get(`/pago/${id}`).then((res) => res.data).catch(handleError),

  createPago: (data) =>
    api
      .post('/pago/new', {
        ...data,
        metodo: normalizarMetodoPago(data?.metodo),
      })
      .then((res) => res.data)
      .catch(handleError),

  confirmarPagoPorCompraTotal: (idCompraTotal, data) =>
    api
      .put(`/pago/confirmar/compra-total/${idCompraTotal}`, data)
      .then((res) => res.data)
      .catch(handleError),
};

export const qrApi = {
  generarQR: (data) =>
    api.post('/qr/generar', data).then((res) => res.data).catch(handleError),

  verificarPagoQR: (data) =>
    api.post('/qr/verificar', data).then((res) => res.data).catch(handleError),
};

export const comprobantesApi = {
  enviarComprobantePorPago: (idPago) =>
    api
      .post('/comprobantes/enviar', { id_pago: idPago })
      .then((res) => res.data)
      .catch(handleError),

  enviarComprobantePorCompraTotal: (idCompraTotal) =>
    api
      .post('/comprobantes/enviar', { id_compra_total: idCompraTotal })
      .then((res) => res.data)
      .catch(handleError),
};
//para ver el historial de movimientos de un estudiante
export const saldosMovimientosApi = {
  fetchSaldosByEstudianteId: (estudianteId) =>
    api.get(`/saldo-movimientos/${estudianteId}`).then((res) => res.data).catch(handleError),
};
export default apiPagos;