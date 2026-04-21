import { createSlice } from "@reduxjs/toolkit";
import { obtenerPlanesThunk } from "./PlanThunk";

const initialState = {
  planes: [],
  cargando: false,
  error: null,
};

const planesSlice = createSlice({
  name: "planes",
  initialState,
  reducers: {
    clearPlanesError: (state) => {
      state.error = null;
    },
    resetPlanesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerPlanesThunk.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(obtenerPlanesThunk.fulfilled, (state, action) => {
        state.cargando = false;
        state.planes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(obtenerPlanesThunk.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload || "No se pudieron cargar los planes";
      });
  },
});

export const { clearPlanesError, resetPlanesState } = planesSlice.actions;

export const selectPlanes = (state) => state.planes.planes;
export const selectPlanesLoading = (state) => state.planes.cargando;
export const selectPlanesError = (state) => state.planes.error;

export default planesSlice.reducer;