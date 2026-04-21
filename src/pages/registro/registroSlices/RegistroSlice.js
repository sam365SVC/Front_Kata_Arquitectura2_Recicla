import { createSlice } from "@reduxjs/toolkit";
import {
  registrarClienteThunk,
  registrarTenantThunk,
} from "./RegistroThunk";

const initialState = {
  error: null,
  success: false,
  registroLoading: false,
};

const registroSlice = createSlice({
  name: "registro",
  initialState,
  reducers: {
    clearRegistroState: (state) => {
      state.registroLoading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registrarClienteThunk.pending, (state) => {
        state.registroLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registrarClienteThunk.fulfilled, (state) => {
        state.registroLoading = false;
        state.success = true;
      })
      .addCase(registrarClienteThunk.rejected, (state, action) => {
        state.registroLoading = false;
        state.error = action.payload || "Error al registrar cliente";
      })

      .addCase(registrarTenantThunk.pending, (state) => {
        state.registroLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registrarTenantThunk.fulfilled, (state) => {
        state.registroLoading = false;
        state.success = true;
      })
      .addCase(registrarTenantThunk.rejected, (state, action) => {
        state.registroLoading = false;
        state.error = action.payload || "Error al registrar empresa";
      });
  },
});

export const { clearRegistroState } = registroSlice.actions;
export default registroSlice.reducer;