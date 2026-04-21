import { createSlice } from "@reduxjs/toolkit";
import { activarUsuarioEmpresaThunk } from "./RegistroEmpleadoThunk";

const initialState = {
  isLoading: false,
  error: null,
  success: false,
  data: null,
};

const activarEmpleadoSlice = createSlice({
  name: "activarEmpleado",
  initialState,
  reducers: {
    clearActivarEmpleadoState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(activarUsuarioEmpresaThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(activarUsuarioEmpresaThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(activarUsuarioEmpresaThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload || "Error al activar la cuenta.";
      });
  },
});

export const { clearActivarEmpleadoState } = activarEmpleadoSlice.actions;
export default activarEmpleadoSlice.reducer;