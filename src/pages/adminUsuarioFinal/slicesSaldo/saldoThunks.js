import { createAsyncThunk } from "@reduxjs/toolkit";
import { saldoApi } from "../../../lib/api"; // ajusta la ruta

// ==========================
// OBTENER SALDO ACTUAL
// ==========================
export const fetchSaldoActual = createAsyncThunk(
  "saldo/fetchSaldoActual",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await saldoApi.fetchSaldoActual(userId);
      return res.saldo; // backend devuelve { ok, saldo }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================
// OBTENER MOVIMIENTOS
// ==========================
export const fetchMovimientos = createAsyncThunk(
  "saldo/fetchMovimientos",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await saldoApi.fetchMovimientos(userId);
      return res; // lista de movimientos
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================
// CREAR MOVIMIENTO
// ==========================
export const crearMovimiento = createAsyncThunk(
  "saldo/crearMovimiento",
  async (data, { rejectWithValue }) => {
    try {
      const res = await saldoApi.crearMovimiento(data);
      return res.movimiento;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);