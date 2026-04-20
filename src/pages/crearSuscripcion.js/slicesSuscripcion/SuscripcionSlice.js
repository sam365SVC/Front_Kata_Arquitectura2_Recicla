import { createSlice } from "@reduxjs/toolkit";
import {
  crearSuscripcionThunk,
} from "./SuscripcionThunk";

const initialState = {
  suscripcionActual: null,

  metodoSeleccionado: "QR",
  tipoComprobante: "RECIBO",
  razonSocial: "",
  nitCi: "",

  qrData: null,
  qrStatus: null,

  pago: null,
  factura: null,

  loading: false,
  verificandoQR: false,
  procesandoTarjeta: false,
  procesandoTransferencia: false,
  procesandoSaldo: false,
  pagoConfirmado: false,

  error: null,
  successMessage: null,
};

const limpiarEstadoTemporalPago = (state) => {
  state.qrData = null;
  state.qrStatus = null;
  state.pago = null;
  state.factura = null;
  state.loading = false;
  state.verificandoQR = false;
  state.procesandoTarjeta = false;
  state.procesandoTransferencia = false;
  state.procesandoSaldo = false;
  state.pagoConfirmado = false;
  state.error = null;
  state.successMessage = null;
};

const actualizarSuscripcionSiExiste = (state, action) => {
  const suscripcion =
    action.payload?.suscripcion ||
    action.payload?.data ||
    action.payload ||
    null;

  if (suscripcion) {
    state.suscripcionActual = suscripcion;
  }
};

const suscripcionSlice = createSlice({
  name: "checkout",
  initialState,

  reducers: {
    setsuscripcionActual: (state, action) => {
      state.suscripcionActual = action.payload || null;
      limpiarEstadoTemporalPago(state);
    },

    clearCheckout: () => initialState,

    setMetodoSeleccionado: (state, action) => {
      state.metodoSeleccionado = action.payload || "QR";
      state.error = null;
      state.successMessage = null;
      state.qrData = null;
      state.qrStatus = null;
      state.verificandoQR = false;
    },

    setTipoComprobante: (state, action) => {
      state.tipoComprobante = action.payload;
    },

    setRazonSocial: (state, action) => {
      state.razonSocial = action.payload;
    },

    setNitCi: (state, action) => {
      state.nitCi = action.payload;
    },

    clearCheckoutError: (state) => {
      state.error = null;
    },

    clearCheckoutSuccess: (state) => {
      state.successMessage = null;
    },

    resetCheckoutFlow: (state) => {
      limpiarEstadoTemporalPago(state);
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // SUSCRIPCIÓN
      // =========================
      .addCase(crearSuscripcionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearSuscripcionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.suscripcionActual = action.payload;
        state.successMessage = "Suscripción creada correctamente";
      })
      .addCase(crearSuscripcionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudo crear la suscripción";
      })
  },
});

export const {
  setsuscripcionActual,
  clearCheckout,
  setMetodoSeleccionado,
  setTipoComprobante,
  setRazonSocial,
  setNitCi,
  clearCheckoutError,
  clearCheckoutSuccess,
  resetCheckoutFlow,
} = suscripcionSlice.actions;

export default suscripcionSlice.reducer;