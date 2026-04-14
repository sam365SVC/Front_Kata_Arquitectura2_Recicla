import { createSlice } from "@reduxjs/toolkit";
import { fetchTiposDispositivo } from "./TiposDispositivoThunk";

const initialState = {
    tiposDispositivo: [],
    isLoading: false,
    error: null,
};

const TiposDispositivoSlice = createSlice({
    name: "tiposDispositivo",
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTiposDispositivo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTiposDispositivo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tiposDispositivo = action.payload || [];
            })  
            .addCase(fetchTiposDispositivo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Ocurrió un error al cargar los tipos de dispositivo";
            });
    }
});

export const { clearError } = TiposDispositivoSlice.actions;
export const selectTiposDispositivo = (state) => state.tiposDispositivo.tiposDispositivo;
export const selectTiposDispositivoLoading = (state) => state.tiposDispositivo.isLoading;
export const selectTiposDispositivoError = (state) => state.tiposDispositivo.error;


export default TiposDispositivoSlice.reducer;   
