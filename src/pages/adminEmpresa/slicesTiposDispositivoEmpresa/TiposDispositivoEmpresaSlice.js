import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTiposDispositivoEmpresa,
  fetchTipoDispositivoEmpresaById,
  createTipoDispositivoEmpresa,
  updateTipoDispositivoEmpresa,
  changeEstadoTipoDispositivoEmpresa,
} from "./TiposDispositivoEmpresaThunk";

const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  successMessage: null,
  selectedItem: null,
};

const tiposDispositivoEmpresaSlice = createSlice({
  name: "tiposDispositivoEmpresa",
  initialState,
  reducers: {
    clearTiposDispositivoEmpresaError: (state) => {
      state.error = null;
    },

    clearTiposDispositivoEmpresaSuccess: (state) => {
      state.successMessage = null;
    },

    clearSelectedTipoDispositivoEmpresa: (state) => {
      state.selectedItem = null;
    },

    resetTiposDispositivoEmpresaState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiposDispositivoEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTiposDispositivoEmpresa.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload?.items)
          ? action.payload.items
          : [];
        state.total = action.payload?.total || state.items.length;
      })
      .addCase(fetchTiposDispositivoEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Error al cargar tipos de dispositivo";
      })

      .addCase(fetchTipoDispositivoEmpresaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTipoDispositivoEmpresaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload || null;
      })
      .addCase(fetchTipoDispositivoEmpresaById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Error al obtener el tipo de dispositivo";
      })

      .addCase(createTipoDispositivoEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTipoDispositivoEmpresa.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Tipo de dispositivo creado correctamente";

        const nuevo = action.payload?.item;
        if (nuevo) {
          state.items = [nuevo, ...state.items];
          state.total = state.items.length;
        }
      })
      .addCase(createTipoDispositivoEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Error al crear el tipo de dispositivo";
      })

      .addCase(updateTipoDispositivoEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTipoDispositivoEmpresa.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message ||
          "Tipo de dispositivo actualizado correctamente";

        const actualizado = action.payload?.item;

        if (actualizado?._id) {
          state.items = state.items.map((item) =>
            item._id === actualizado._id ? actualizado : item
          );

          if (state.selectedItem?._id === actualizado._id) {
            state.selectedItem = actualizado;
          }
        }
      })
      .addCase(updateTipoDispositivoEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Error al actualizar el tipo de dispositivo";
      })

      .addCase(changeEstadoTipoDispositivoEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeEstadoTipoDispositivoEmpresa.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message ||
          "Estado del tipo de dispositivo actualizado correctamente";

        const actualizado = action.payload?.item;

        if (actualizado?._id) {
          state.items = state.items.map((item) =>
            item._id === actualizado._id ? actualizado : item
          );

          if (state.selectedItem?._id === actualizado._id) {
            state.selectedItem = actualizado;
          }
        }
      })
      .addCase(changeEstadoTipoDispositivoEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Error al cambiar el estado del tipo de dispositivo";
      });
  },
});

export const {
  clearTiposDispositivoEmpresaError,
  clearTiposDispositivoEmpresaSuccess,
  clearSelectedTipoDispositivoEmpresa,
  resetTiposDispositivoEmpresaState,
} = tiposDispositivoEmpresaSlice.actions;

export const selectTiposDispositivoEmpresa = (state) =>
  state.tiposDispositivoEmpresa.items;

export const selectTiposDispositivoEmpresaTotal = (state) =>
  state.tiposDispositivoEmpresa.total;

export const selectTiposDispositivoEmpresaLoading = (state) =>
  state.tiposDispositivoEmpresa.loading;

export const selectTiposDispositivoEmpresaError = (state) =>
  state.tiposDispositivoEmpresa.error;

export const selectTiposDispositivoEmpresaSuccess = (state) =>
  state.tiposDispositivoEmpresa.successMessage;

export const selectTipoDispositivoEmpresaSelected = (state) =>
  state.tiposDispositivoEmpresa.selectedItem;

export default tiposDispositivoEmpresaSlice.reducer;