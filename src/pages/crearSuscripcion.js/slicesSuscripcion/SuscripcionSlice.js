import { createSlice } from "@reduxjs/toolkit";
import { crearSuscripcionThunk } from "./SuscripcionThunk";

const initialState = {
  suscripcionActual: null,
  nombre_plan: "",

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

const suscripcionSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setsuscripcionActual: (state, action) => {
      state.suscripcionActual = action.payload || null;
      limpiarEstadoTemporalPago(state);
    },

    setNombrePlan: (state, action) => {
      state.nombre_plan = action.payload || "";
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
      .addCase(crearSuscripcionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(crearSuscripcionThunk.fulfilled, (state, action) => {
        state.loading = false;

        const suscripcion =
          action.payload?.suscripcion ||
          action.payload?.data?.suscripcion ||
          action.payload?.data ||
          null;

        state.suscripcionActual = suscripcion;

        if (suscripcion?.nombre_plan) {
          state.nombre_plan = suscripcion.nombre_plan;
        }

        state.successMessage = action.payload?.forceApplied
          ? "Se creó la suscripción reemplazando la anterior por tratarse de un upgrade."
          : "Suscripción creada correctamente";
      })
      .addCase(crearSuscripcionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudo crear la suscripción";
      });
  },
});

export const {
  setsuscripcionActual,
  setNombrePlan,
  clearCheckout,
  setMetodoSeleccionado,
  setTipoComprobante,
  setRazonSocial,
  setNitCi,
  clearCheckoutError,
  clearCheckoutSuccess,
  resetCheckoutFlow,
} = suscripcionSlice.actions;

export const selectSuscripcionActual = (state) =>
  state.checkout.suscripcionActual;

export const selectNombrePlan = (state) =>
  state.checkout.nombre_plan;

export const selectCheckoutLoading = (state) =>
  state.checkout.loading;

export const selectCheckoutError = (state) =>
  state.checkout.error;

export const selectCheckoutSuccess = (state) =>
  state.checkout.successMessage;

export const selectMetodoSeleccionado = (state) =>
  state.checkout.metodoSeleccionado;

export default suscripcionSlice.reducer;