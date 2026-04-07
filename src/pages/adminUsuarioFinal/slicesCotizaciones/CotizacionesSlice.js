import { createSlice } from "@reduxjs/toolkit";
import { fetchCotizacionesByClienteId, fetchCotizacionById, aceptarCotizacionInicial, crearSolicitudCotizacion, rechazarCotizacionInicial } from "./CotizacionesThunk";

const initialState = {
    cotizaciones: [],
    cotizacionesById: {},
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    isLoading: false,
    error: null,
    cotizacionesCreating: false,
    cotizacionesError: null,
};

const CotizacionesSlice = createSlice({
    name: "cotizaciones",
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCotizacionesByClienteId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCotizacionesByClienteId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cotizaciones = action.payload || [];
            })  
            .addCase(fetchCotizacionesByClienteId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Ocurrió un error al cargar las cotizaciones";
            })
            .addCase(fetchCotizacionById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCotizacionById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cotizacionesById[action.payload._id] = action.payload;
            })
            .addCase(fetchCotizacionById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Ocurrió un error al cargar la cotización";
            })

            .addCase(crearSolicitudCotizacion.pending, (state) => {
                state.cotizacionesCreating = true;
                state.cotizacionesError = null;
            })
            .addCase(crearSolicitudCotizacion.fulfilled, (state, action) => {
                state.cotizacionesCreating = false;
                state.cotizaciones.push(action.payload);
            })
            .addCase(crearSolicitudCotizacion.rejected, (state, action) => {
                state.cotizacionesCreating = false;
                state.cotizacionesError = action.payload || "Ocurrió un error al crear la solicitud de cotización";
            })
            .addCase(aceptarCotizacionInicial.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(aceptarCotizacionInicial.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.cotizaciones.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.cotizaciones[index] = action.payload;
                }
            })
            .addCase(aceptarCotizacionInicial.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Ocurrió un error al aceptar la cotización";
            })
            .addCase(rechazarCotizacionInicial.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(rechazarCotizacionInicial.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.cotizaciones.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.cotizaciones[index] = action.payload;
                }
            })
            .addCase(rechazarCotizacionInicial.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Ocurrió un error al rechazar la cotización";
            });
    }
});

export const { clearError} = CotizacionesSlice.actions;

export const selectCotizaciones = (state) => state.cotizaciones.cotizaciones || [];
export const selectCotizacionesLoading = (state) => state.cotizaciones.isLoading;
export const selectCotizacionesError = (state) => state.cotizaciones.error;
export const selectCotizacionesCreating = (state) => state.cotizaciones.cotizacionesCreating;
export const selectCotizacionesCreateError = (state) => state.cotizaciones.cotizacionesError;
export const selectCotizacionesState = (state) => state.cotizaciones || initialState;

export default CotizacionesSlice.reducer;