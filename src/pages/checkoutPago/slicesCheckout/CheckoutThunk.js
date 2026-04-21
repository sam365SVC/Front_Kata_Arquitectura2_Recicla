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

const createOrReusePago = async ({ idSuscripcion, metodo, monto, tipoPago }) => {
  try {
    return await pagoApi.createPago({
      referencia_id: idSuscripcion,
      metodo,
      monto,
      tipo_pago: tipoPago,
    });
  } catch (error) {
    const message = extractErrorMessage(error).toLowerCase();

    if (message.includes("ya existe") || message.includes("reutilizado")) {
      return { ok: true, reused: true };
    }

    throw error;
  }
};

const resolveSuscripcionFromPayload = (payload) => {
  return payload?.suscripcion || payload?.data?.suscripcion || null;
};

const resolvePagoFromPayload = (payload) => {
  return payload?.pago || payload?.data?.pago || null;
};

const resolveFacturaFromPayload = (payload) => {
  return payload?.factura || payload?.data?.factura || null;
};

const resolvePlanChangeFromPayload = (payload) => {
  return payload?.plan || payload?.data?.plan || null;
};

const buildSuccessMessage = (payload) => {
  const suscripcion = resolveSuscripcionFromPayload(payload);
  const plan = resolvePlanChangeFromPayload(payload);

  const nombrePlan =
    suscripcion?.nombre_plan ||
    suscripcion?.plan_nombre ||
    payload?.nombre_plan ||
    null;

  const fechaFin = suscripcion?.fecha_fin
    ? new Date(suscripcion.fecha_fin).toLocaleDateString("es-BO")
    : null;

  const esFree = String(nombrePlan || "").trim().toLowerCase() === "free";

  if (plan?.ok && nombrePlan && fechaFin) {
    if (esFree) {
      return `Tu plan ${nombrePlan} fue activado correctamente. Estará vigente hasta ${fechaFin}.`;
    }

    return `Tu upgrade al plan ${nombrePlan} fue aplicado correctamente. Tendrás este plan activo hasta ${fechaFin}.`;
  }

  return payload?.message || "Pago confirmado correctamente";
};

// =========================
// INICIAR PAGO QR
// =========================
export const iniciarPagoQrThunk = createAsyncThunk(
  "checkout/iniciarPagoQr",
  async (
    { idSuscripcion, total, moneda = "BOB", gloss, tipoPago },
    { rejectWithValue }
  ) => {
    try {
      await createOrReusePago({
        idSuscripcion,
        metodo: "QR",
        monto: total,
        tipoPago,
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

// =========================
// VERIFICAR QR
// =========================
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

// =========================
// CONFIRMAR PAGO
// =========================
export const confirmarPagoThunk = createAsyncThunk(
  "checkout/confirmarPago",
  async (
    { idSuscripcion, tipo, razonSocial, nitCi },
    { rejectWithValue }
  ) => {
    try {
      const response = await pagoApi.confirmarPagoPorSuscripcion(idSuscripcion, {
        tipo,
        razon_social: razonSocial,
        nit_ci: nitCi,
      });

      return {
        ...response,
        pago: resolvePagoFromPayload(response),
        factura: resolveFacturaFromPayload(response),
        suscripcion: resolveSuscripcionFromPayload(response),
        planChange: resolvePlanChangeFromPayload(response),
        successMessage: buildSuccessMessage(response),
      };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// TARJETA
// =========================
export const simularPagoTarjetaThunk = createAsyncThunk(
  "checkout/simularPagoTarjeta",
  async (
    { idSuscripcion, total, tipo, razonSocial, nitCi, tipoPago },
    { rejectWithValue }
  ) => {
    try {
      await createOrReusePago({
        idSuscripcion,
        metodo: "TARJETA",
        monto: total,
        tipoPago,
      });

      await sleep(2500);

      const response = await pagoApi.confirmarPagoSuscripcion(idSuscripcion, {
        tipo,
        razon_social: razonSocial,
        nit_ci: nitCi,
      });

      return {
        ...response,
        pago: resolvePagoFromPayload(response),
        factura: resolveFacturaFromPayload(response),
        suscripcion: resolveSuscripcionFromPayload(response),
        planChange: resolvePlanChangeFromPayload(response),
        successMessage: buildSuccessMessage(response),
      };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// TRANSFERENCIA
// =========================
export const simularPagoTransferenciaThunk = createAsyncThunk(
  "checkout/simularPagoTransferencia",
  async (
    { idSuscripcion, total, tipo, razonSocial, nitCi, tipoPago },
    { rejectWithValue }
  ) => {
    try {
      await createOrReusePago({
        idSuscripcion,
        metodo: "TRANSFERENCIA",
        monto: total,
        tipoPago,
      });

      await sleep(4000);

      const response = await pagoApi.confirmarPagoSuscripcion(idSuscripcion, {
        tipo,
        razon_social: razonSocial,
        nit_ci: nitCi,
      });

      return {
        ...response,
        pago: resolvePagoFromPayload(response),
        factura: resolveFacturaFromPayload(response),
        suscripcion: resolveSuscripcionFromPayload(response),
        planChange: resolvePlanChangeFromPayload(response),
        successMessage: buildSuccessMessage(response),
      };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// SALDO
// =========================
export const pagarConSaldoThunk = createAsyncThunk(
  "checkout/pagarConSaldo",
  async (
    { idSuscripcion, tipo, razonSocial, nitCi, tipoPago },
    { rejectWithValue }
  ) => {
    try {
      await createOrReusePago({
        idSuscripcion,
        metodo: "SALDO",
        monto: 0,
        tipoPago,
      });

      const response = await pagoApi.confirmarPagoSuscripcion(idSuscripcion, {
        tipo,
        razon_social: razonSocial,
        nit_ci: nitCi,
      });

      return {
        ...response,
        pago: resolvePagoFromPayload(response),
        factura: resolveFacturaFromPayload(response),
        suscripcion: resolveSuscripcionFromPayload(response),
        planChange: resolvePlanChangeFromPayload(response),
        successMessage: buildSuccessMessage(response),
      };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// OBTENER SUSCRIPCIÓN
// =========================
export const confirmarSuscripcionThunk = createAsyncThunk(
  "checkout/confirmarSuscripcionPorId",
  async (idSuscripcion, { rejectWithValue }) => {
    try {
      return await pagoApi.confirmarSuscripcionId(idSuscripcion);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// =========================
// ENVIAR COMPROBANTE
// =========================
export const intentarEnviarComprobante = createAsyncThunk(
  "checkout/intentarEnviarComprobante",
  async ({ idSuscripcionPago, email }, { rejectWithValue }) => {
    try {
      if (!idSuscripcionPago || !email) return null;

      return await comprobantesApi.enviarComprobantePorPago({
        idSuscripcionPago,
        email,
      });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);