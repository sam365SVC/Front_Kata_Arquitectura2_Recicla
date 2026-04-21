import { createSlice } from "@reduxjs/toolkit";
import { fetchSuscripciones } from "./IngresosThunk";

const initialState = {
  suscripciones: [],
  isLoading: false,
  error: null,
};

const ingresosSlice = createSlice({
  name: "ingresos",
  initialState,
  reducers: {
    clearSuscripcionesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuscripciones.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuscripciones.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suscripciones = action.payload || [];
      })
      .addCase(fetchSuscripciones.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Ocurrió un error al cargar las suscripciones";
      });
  },
});

export const { clearSuscripcionesError } = ingresosSlice.actions;

export const selectSuscripciones = (state) =>
  state.ingresos?.suscripciones || [];

export const selectSuscripcionesLoading = (state) =>
  state.ingresos?.isLoading || false;

export const selectSuscripcionesError = (state) =>
  state.ingresos?.error || null;

export default ingresosSlice.reducer;