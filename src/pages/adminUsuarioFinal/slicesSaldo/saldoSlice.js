import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSaldoActual,
  fetchMovimientos,
  crearMovimiento,
} from "./saldoThunks";

const initialState = {
  saldo: 0,
  movimientos: [],
  loading: false,
  error: null,
};

const saldoSlice = createSlice({
  name: "saldo",
  initialState,
  reducers: {
    clearSaldo: (state) => {
      state.saldo = 0;
      state.movimientos = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ==========================
      // SALDO ACTUAL
      // ==========================
      .addCase(fetchSaldoActual.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaldoActual.fulfilled, (state, action) => {
        state.loading = false;
        state.saldo = action.payload;
      })
      .addCase(fetchSaldoActual.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================
      // MOVIMIENTOS
      // ==========================
      .addCase(fetchMovimientos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovimientos.fulfilled, (state, action) => {
        state.loading = false;
        state.movimientos = action.payload;
      })
      .addCase(fetchMovimientos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================
      // CREAR MOVIMIENTO
      // ==========================
      .addCase(crearMovimiento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearMovimiento.fulfilled, (state, action) => {
        state.loading = false;

        // agregar movimiento al inicio
        state.movimientos.unshift(action.payload);

        // actualizar saldo automáticamente
        const { naturaleza, monto } = action.payload;

        if (naturaleza === "C") {
          state.saldo += Number(monto);
        } else {
          state.saldo -= Number(monto);
        }
      })
      .addCase(crearMovimiento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSaldo } = saldoSlice.actions;
export default saldoSlice.reducer;