import { createAsyncThunk } from "@reduxjs/toolkit";
import { pagoApi} from "../../../lib/api";

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

export const crearSuscripcionThunk = createAsyncThunk(
  "checkout/crearSuscripcion",
  async (
    { user_id, servicio_id, meses, precio_unitario, moneda = "BOB" ,nombre_plan},
    { rejectWithValue }
  ) => {
    try {
      const response = await pagoApi.createSuscripcion({
        user_id,
        servicio_id,
        meses,
        precio_unitario,
        moneda,
        nombre_plan,
      });

      // Opcional: devolver directamente la suscripción limpia
      return response.suscripcion;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);