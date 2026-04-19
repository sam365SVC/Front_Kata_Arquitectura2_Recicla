import { createSlice } from "@reduxjs/toolkit";
import { usuariosEmpresaMock } from "../mock/data";

const initialState = {
  items: usuariosEmpresaMock,
  loading: false,
  error: null,
  selectedUser: null,
};

const usuariosEmpresaSlice = createSlice({
  name: "usuariosEmpresa",
  initialState,
  reducers: {
    setUsuariosEmpresa: (state, action) => {
      state.items = action.payload;
    },

    addUsuarioEmpresa: (state, action) => {
      state.items = [action.payload, ...state.items];
    },

    updateUsuarioEmpresa: (state, action) => {
      const updatedUser = action.payload;

      state.items = state.items.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      );
    },

    toggleEstadoUsuarioEmpresa: (state, action) => {
      const userId = action.payload;

      state.items = state.items.map((user) =>
        user.id === userId
          ? {
              ...user,
              estado: user.estado === "Activo" ? "Inactivo" : "Activo",
            }
          : user
      );
    },

    setSelectedUsuarioEmpresa: (state, action) => {
      state.selectedUser = action.payload;
    },

    clearSelectedUsuarioEmpresa: (state) => {
      state.selectedUser = null;
    },

    setUsuariosEmpresaLoading: (state, action) => {
      state.loading = action.payload;
    },

    setUsuariosEmpresaError: (state, action) => {
      state.error = action.payload;
    },

    clearUsuariosEmpresaError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUsuariosEmpresa,
  addUsuarioEmpresa,
  updateUsuarioEmpresa,
  toggleEstadoUsuarioEmpresa,
  setSelectedUsuarioEmpresa,
  clearSelectedUsuarioEmpresa,
  setUsuariosEmpresaLoading,
  setUsuariosEmpresaError,
  clearUsuariosEmpresaError,
} = usuariosEmpresaSlice.actions;

export default usuariosEmpresaSlice.reducer;