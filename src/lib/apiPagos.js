import axios from 'axios';
import { store } from '../store/index';

const apiPagos = axios.create({
  baseURL: 'http://localhost:3001/api',
});

const METODO_TRANSFERENCIA = 'TRANSFERENCIA';

const normalizarMonedaPago = (moneda) => {
  const valor = String(moneda || '').trim().toUpperCase();
  if (valor === 'TRANSFERENCIA') return METODO_TRANSFERENCIA;
  return valor;
};

// REQUEST INTERCEPTOR
apiPagos.interceptors.request.use((config) => {
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

// RESPONSE INTERCEPTOR
apiPagos.interceptors.response.use(
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
    apiPagos.get('/pagos').then(res => res.data).catch(handleError),

  fetchPagoById: (id) =>
    apiPagos.get(`/pagos/${id}`).then(res => res.data).catch(handleError),

  createPago: (data) =>
    apiPagos
      .post('/pagos', {
        ...data,
        metodo: normalizarMetodoPago(data?.metodo),
      }).then(res => res.data)
      .catch(handleError),

  // SUSCRIPCIONES    
  confirmarPagoSuscripcion: (idSuscripcion, data) =>
    apiPagos
      .put(`/suscripcion-pagos/${idSuscripcion}`, data)
        .then(res => res.data)
        .catch(handleError),

        
  createSuscripcion: (data) =>
    apiPagos
      .post('/suscripcion-pagos/new', {
        user_id: data.user_id,
        servicio_id: data.servicio_id,
        meses: data.meses,
        precio_unitario: data.precio_unitario,
        moneda: data.moneda,
      })
      .then(res => res.data)
      .catch(handleError),

  confirmarPagoSuscripcion: (idSuscripcion, data) =>
    apiPagos
      .put(`/suscripcion-pagos/${idSuscripcion}`, data)
      .then(res => res.data)
      .catch(handleError),
};

export const qrApi = {
  generarQR: (data) =>
    apiPagos.post('/qr/generar', data).then(res => res.data).catch(handleError),

  verificarPagoQR: (data) =>
    apiPagos.post('/qr/verificar', data).then(res => res.data).catch(handleError),
};

export const comprobantesApi = {
  enviarComprobantePorPago: (idPago) =>
    api
      .post('/comprobantes/enviar', { id_pago: idPago })
      .then((res) => res.data)
      .catch(handleError),

};
/*
export const saldosMovimientosApi = {
  fetchSaldosByEstudianteId: (estudianteId) =>
    api.get(`/saldo-movimientos/${estudianteId}`).then((res) => res.data).catch(handleError),
};*/