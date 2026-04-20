import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFlagsThunk,
  verificarPermisoThunk,
  invalidarCacheThunk,
  cambiarPlanThunk,
  actualizarUsoThunk,
} from "./flagsThunk";

const initialState = {
  flags: null,
  permiso: null,

  loading: false,
  verificando: false,
  actualizando: false,

  error: null,
  successMessage: null,
};

// Helpers
const limpiarEstado = (state) => {
  state.loading = false;
  state.verificando = false;
  state.actualizando = false;
  state.error = null;
  state.successMessage = null;
};

const flagsSlice = createSlice({
  name: "flags",
  initialState,

  reducers: {
    clearFlags: () => initialState,

    clearFlagsError: (state) => {
      state.error = null;
    },

    clearFlagsSuccess: (state) => {
      state.successMessage = null;
    },

    resetFlagsState: (state) => {
      limpiarEstado(state);
    },

    clearPermiso: (state) => {
      state.permiso = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // FETCH FLAGS
      // =========================
      .addCase(fetchFlagsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlagsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.flags = action.payload;
      })
      .addCase(fetchFlagsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "No se pudieron obtener los flags";
      })

      // =========================
      // VERIFICAR PERMISO
      // =========================
      .addCase(verificarPermisoThunk.pending, (state) => {
        state.verificando = true;
        state.error = null;
      })
      .addCase(verificarPermisoThunk.fulfilled, (state, action) => {
        state.verificando = false;
        state.permiso = action.payload;
      })
      .addCase(verificarPermisoThunk.rejected, (state, action) => {
        state.verificando = false;
        state.error = action.payload || "Error al verificar permiso";
      })

      // =========================
      // INVALIDAR CACHE
      // =========================
      .addCase(invalidarCacheThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(invalidarCacheThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.mensaje || "Cache invalidado";
      })
      .addCase(invalidarCacheThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al invalidar cache";
      })

      // =========================
      // CAMBIAR PLAN
      // =========================
      .addCase(cambiarPlanThunk.pending, (state) => {
        state.actualizando = true;
        state.error = null;
      })
      .addCase(cambiarPlanThunk.fulfilled, (state, action) => {
        state.actualizando = false;
        state.successMessage = "Plan actualizado correctamente";
        state.flags = action.payload; // opcional si backend devuelve flags actualizados
      })
      .addCase(cambiarPlanThunk.rejected, (state, action) => {
        state.actualizando = false;
        state.error = action.payload || "Error al cambiar el plan";
      })

      // =========================
      // ACTUALIZAR USO
      // =========================
      .addCase(actualizarUsoThunk.pending, (state) => {
        state.actualizando = true;
        state.error = null;
      })
      .addCase(actualizarUsoThunk.fulfilled, (state, action) => {
        state.actualizando = false;
        state.successMessage = "Uso actualizado correctamente";
      })
      .addCase(actualizarUsoThunk.rejected, (state, action) => {
        state.actualizando = false;
        state.error = action.payload || "Error al actualizar uso";
      });
  },
});

export const {
  clearFlags,
  clearFlagsError,
  clearFlagsSuccess,
  resetFlagsState,
  clearPermiso,
} = flagsSlice.actions;

export default flagsSlice.reducer;