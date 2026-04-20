import { createAsyncThunk } from "@reduxjs/toolkit";
import { pagoApi, qrApi, comprobantesApi } from "../../../lib/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractErrorMessage = (error) => {
  if (!error) return "Ocurrió un error inesperado";

  return (
    error.message ||
    error.msg ||
    error.data?.message ||
    error.data?.msg ||
    "Ocurrió un error inesperado"
  );
};

const createOrReusePago = async ({ idSuscripcion, metodo, monto }) => {
  try {
    return await pagoApi.createPago({
      suscripcion_pago_id: idSuscripcion,
      metodo,
      monto,
    });
  } catch (error) {

    const message = extractErrorMessage(error).toLowerCase();

    if (
      message.includes("ya existe") ||
      message.includes("reutilizado")
    ) {
      return { ok: true, reused: true };
    }

    throw error;
  }
};

export const iniciarPagoQrThunk = createAsyncThunk(
  "checkout/iniciarPagoQr",
  async (
    { idSuscripcion, total, moneda = "BOB", gloss },
    { rejectWithValue }
  ) => {
    try {
      
      await createOrReusePago({
        idSuscripcion,
        metodo: "QR",
        monto: total,
      });

      const response = await qrApi.generarQR({
        suscripcion_pago_id: idSuscripcion,
        currency: moneda,
        gloss: gloss || "Pago de suscripción",
        amount: Number(total),
      });

      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const verificarQrThunk = createAsyncThunk(
  "checkout/verificarQr",
  async ({ idSuscripcion, qrId }, { rejectWithValue }) => {
    try {
      const payload = idSuscripcion
        ? { suscripcion_id: idSuscripcion }
        : { qrId };

      return await qrApi.verificarPagoQR(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const confirmarPagoThunk = createAsyncThunk(
  "checkout/confirmarPago",
  async (
    { idSuscripcion, tipo, razonSocial, nitCi },
    { rejectWithValue }
  ) => {
    try {
      return await pagoApi.confirmarPagoPorSuscripcion(idSuscripcion, {
        tipo,
        razon_social: razonSocial,
        nit_ci: nitCi,
      });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const simularPagoTarjetaThunk = createAsyncThunk(
  "checkout/simularPagoTarjeta",
  async (
    { idSuscripcion, total, tipo, razonSocial, nitCi },
    { rejectWithValue }
  ) => {
    try {
      await createOrReusePago({
        idSuscripcion,
        metodo: "TARJETA",
        monto: total,
      });

      await sleep(2500);

      return await pagoApi.confirmarPagoSuscripcion(idSuscripcion, {
        tipo,
        razon_social: razonSocial,
        nit_ci: nitCi,
      });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const simularPagoTransferenciaThunk = createAsyncThunk(
  "checkout/simularPagoTransferencia",
  async (
    { idSuscripcion, total, tipo, razonSocial, nitCi },
    { rejectWithValue }
  ) => {
    try {
      await createOrReusePago({
        idSuscripcion,
        metodo: "TRANSFERENCIA",
        monto: total,
      });

      await sleep(4000);

      return await pagoApi.confirmarPagoSuscripcion(idSuscripcion, {
        tipo,
        razon_social: razonSocial,
        nit_ci: nitCi,
      });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const pagarConSaldoThunk = createAsyncThunk(
  "checkout/pagarConSaldo",
  async (
    { idSuscripcion, tipo, razonSocial, nitCi },
    { rejectWithValue }
  ) => {
    try {
      await createOrReusePago({
        idSuscripcion,
        metodo: "SALDO",
        monto: 0,
      });

      return await pagoApi.confirmarPagoSuscripcion(idSuscripcion, {
        tipo,
        razon_social: razonSocial,
        nit_ci: nitCi,
      });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const confirmarSuscripcionThunk = createAsyncThunk(
  "suscripcion/confirmarPorId",
  async (idSuscripcion, { rejectWithValue }) => {
    try {
      const response = await pagoApi.confirmarSuscripcionId(idSuscripcion);
      return response;

    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const intentarEnviarComprobante = createAsyncThunk(
  "checkout/intentarEnviarComprobante",
  async ({ idPago, email }, { rejectWithValue }) => {
    try {
      if (idPago) {
        const resp = await comprobantesApi.enviarComprobantePorPago({
          idPago,
          email,
        });

        return resp;
      }

      return null;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);