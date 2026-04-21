import { createSlice } from "@reduxjs/toolkit";
import {
  registrarClienteThunk,
  registrarTenantThunk,
} from "./RegistroThunk";

const initialState = {
  isLoading: false,
  error: null,
  success: false,
};

const registroSlice = createSlice({
  name: "registro",
  initialState,
  reducers: {
    clearRegistroState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registrarClienteThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registrarClienteThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(registrarClienteThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Error al registrar cliente";
      })

      .addCase(registrarTenantThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registrarTenantThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(registrarTenantThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Error al registrar empresa";
      });
  },
});

export const { clearRegistroState } = registroSlice.actions;
export default registroSlice.reducer;