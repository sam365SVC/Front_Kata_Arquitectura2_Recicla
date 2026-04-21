import { createSlice } from "@reduxjs/toolkit";
import {
  iniciarPagoQrThunk,
  verificarQrThunk,
  confirmarPagoThunk,
  simularPagoTarjetaThunk,
  simularPagoTransferenciaThunk,
  pagarConSaldoThunk,
  confirmarSuscripcionThunk,
  intentarEnviarComprobante,
} from "./CheckoutThunk";

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
  planChange: null,

  loading: false,
  verificandoQR: false,
  procesandoTarjeta: false,
  procesandoTransferencia: false,
  procesandoSaldo: false,
  pagoConfirmado: false,

  error: null,
  successMessage: null,
  comprobanteMessage: null,
};

const limpiarEstadoTemporalPago = (state) => {
  state.qrData = null;
  state.qrStatus = null;
  state.pago = null;
  state.factura = null;
  state.planChange = null;
  state.loading = false;
  state.verificandoQR = false;
  state.procesandoTarjeta = false;
  state.procesandoTransferencia = false;
  state.procesandoSaldo = false;
  state.pagoConfirmado = false;
  state.error = null;
  state.successMessage = null;
  state.comprobanteMessage = null;
};

const actualizarSuscripcionSiExiste = (state, action) => {
  const suscripcion =
    action.payload?.suscripcion ||
    action.payload?.data?.suscripcion ||
    action.payload?.data ||
    null;

  if (suscripcion) {
    state.suscripcionActual = suscripcion;
  }
};

const checkoutSlice = createSlice({
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
      state.comprobanteMessage = null;
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
      state.comprobanteMessage = null;
    },

    resetCheckoutFlow: (state) => {
      limpiarEstadoTemporalPago(state);
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================
      // INICIAR QR
      // =========================
      .addCase(iniciarPagoQrThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.qrData = null;
        state.qrStatus = null;
      })
      .addCase(iniciarPagoQrThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.qrData = {
          qrId:
            action.payload?.qr_id ||
            action.payload?.idqr ||
            action.payload?.id ||
            null,
          qr: action.payload?.qr || null,
        };
        state.qrStatus = action.payload?.qrStatus || null;
        state.successMessage =
          action.payload?.message || "QR generado correctamente";

        actualizarSuscripcionSiExiste(state, action);
      })
      .addCase(iniciarPagoQrThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudo generar el QR";
      })

      // =========================
      // VERIFICAR QR
      // =========================
      .addCase(verificarQrThunk.pending, (state) => {
        state.verificandoQR = true;
      })
      .addCase(verificarQrThunk.fulfilled, (state, action) => {
        state.verificandoQR = false;
        state.qrStatus = action.payload || null;
      })
      .addCase(verificarQrThunk.rejected, (state, action) => {
        state.verificandoQR = false;
        state.error = action.payload || "No se pudo verificar el QR";
      })

      // =========================
      // CONFIRMAR PAGO
      // =========================
      .addCase(confirmarPagoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmarPagoThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pagoConfirmado = true;
        state.pago = action.payload?.pago || null;
        state.factura = action.payload?.factura || null;
        state.planChange = action.payload?.planChange || null;
        state.successMessage =
          action.payload?.successMessage ||
          action.payload?.message ||
          "Pago confirmado correctamente";

        actualizarSuscripcionSiExiste(state, action);
      })
      .addCase(confirmarPagoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudo confirmar el pago";
      })

      // =========================
      // TARJETA
      // =========================
      .addCase(simularPagoTarjetaThunk.pending, (state) => {
        state.loading = true;
        state.procesandoTarjeta = true;
        state.error = null;
      })
      .addCase(simularPagoTarjetaThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.procesandoTarjeta = false;
        state.pagoConfirmado = true;
        state.pago = action.payload?.pago || null;
        state.factura = action.payload?.factura || null;
        state.planChange = action.payload?.planChange || null;
        state.successMessage =
          action.payload?.successMessage ||
          action.payload?.message ||
          "Pago con tarjeta confirmado correctamente";

        actualizarSuscripcionSiExiste(state, action);
      })
      .addCase(simularPagoTarjetaThunk.rejected, (state, action) => {
        state.loading = false;
        state.procesandoTarjeta = false;
        state.error = action.payload || "No se pudo procesar el pago con tarjeta";
      })

      // =========================
      // TRANSFERENCIA
      // =========================
      .addCase(simularPagoTransferenciaThunk.pending, (state) => {
        state.loading = true;
        state.procesandoTransferencia = true;
        state.error = null;
      })
      .addCase(simularPagoTransferenciaThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.procesandoTransferencia = false;
        state.pagoConfirmado = true;
        state.pago = action.payload?.pago || null;
        state.factura = action.payload?.factura || null;
        state.planChange = action.payload?.planChange || null;
        state.successMessage =
          action.payload?.successMessage ||
          action.payload?.message ||
          "Transferencia confirmada correctamente";

        actualizarSuscripcionSiExiste(state, action);
      })
      .addCase(simularPagoTransferenciaThunk.rejected, (state, action) => {
        state.loading = false;
        state.procesandoTransferencia = false;
        state.error = action.payload || "No se pudo procesar la transferencia";
      })

      // =========================
      // SALDO
      // =========================
      .addCase(pagarConSaldoThunk.pending, (state) => {
        state.loading = true;
        state.procesandoSaldo = true;
        state.error = null;
      })
      .addCase(pagarConSaldoThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.procesandoSaldo = false;
        state.pagoConfirmado = true;
        state.pago = action.payload?.pago || null;
        state.factura = action.payload?.factura || null;
        state.planChange = action.payload?.planChange || null;
        state.successMessage =
          action.payload?.successMessage ||
          action.payload?.message ||
          "Pago con saldo confirmado correctamente";

        actualizarSuscripcionSiExiste(state, action);
      })
      .addCase(pagarConSaldoThunk.rejected, (state, action) => {
        state.loading = false;
        state.procesandoSaldo = false;
        state.error = action.payload || "No se pudo procesar el pago con saldo";
      })

      // =========================
      // CONSULTAR SUSCRIPCIÓN
      // =========================
      .addCase(confirmarSuscripcionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmarSuscripcionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.suscripcionActual =
          action.payload?.suscripcion ||
          action.payload?.data?.suscripcion ||
          action.payload?.data ||
          null;
      })
      .addCase(confirmarSuscripcionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudo obtener la suscripción";
      })

      // =========================
      // ENVIAR COMPROBANTE
      // =========================
      .addCase(intentarEnviarComprobante.pending, (state) => {
        state.comprobanteMessage = null;
      })
      .addCase(intentarEnviarComprobante.fulfilled, (state, action) => {
        state.comprobanteMessage =
          action.payload?.message || "Comprobante enviado correctamente";
      })
      .addCase(intentarEnviarComprobante.rejected, (state) => {
        state.comprobanteMessage =
          "El pago fue exitoso, pero no se pudo enviar el comprobante.";
      });
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
} = checkoutSlice.actions;

export const selectCheckoutSuscripcionActual = (state) =>
  state?.checkout?.suscripcionActual ?? null;

export const selectCheckoutMetodoSeleccionado = (state) =>
  state?.checkout?.metodoSeleccionado ?? "QR";

export const selectCheckoutTipoComprobante = (state) =>
  state?.checkout?.tipoComprobante ?? "RECIBO";

export const selectCheckoutRazonSocial = (state) =>
  state?.checkout?.razonSocial ?? "";

export const selectCheckoutNitCi = (state) =>
  state?.checkout?.nitCi ?? "";

export const selectCheckoutQrData = (state) =>
  state?.checkout?.qrData ?? null;

export const selectCheckoutQrStatus = (state) =>
  state?.checkout?.qrStatus ?? null;

export const selectCheckoutPago = (state) =>
  state?.checkout?.pago ?? null;

export const selectCheckoutFactura = (state) =>
  state?.checkout?.factura ?? null;

export const selectCheckoutPlanChange = (state) =>
  state?.checkout?.planChange ?? null;

export const selectCheckoutLoading = (state) =>
  Boolean(state?.checkout?.loading);

export const selectCheckoutVerificandoQR = (state) =>
  Boolean(state?.checkout?.verificandoQR);

export const selectCheckoutProcesandoTarjeta = (state) =>
  Boolean(state?.checkout?.procesandoTarjeta);

export const selectCheckoutProcesandoTransferencia = (state) =>
  Boolean(state?.checkout?.procesandoTransferencia);

export const selectCheckoutProcesandoSaldo = (state) =>
  Boolean(state?.checkout?.procesandoSaldo);

export const selectCheckoutPagoConfirmado = (state) =>
  Boolean(state?.checkout?.pagoConfirmado);

export const selectCheckoutError = (state) =>
  state?.checkout?.error ?? null;

export const selectCheckoutSuccess = (state) =>
  state?.checkout?.successMessage ?? null;

export const selectCheckoutComprobanteMessage = (state) =>
  state?.checkout?.comprobanteMessage ?? null;

export default checkoutSlice.reducer;