import { createSlice } from '@reduxjs/toolkit'
import { asignarConductor, fetchPendientes, recalcularRuta } from '../thunks/despachoThunks'
 
const despachoSlice = createSlice({
  name: 'despacho',
  initialState: {
    pendientes: [],
    rutaCalculada: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearRuta(state) { state.rutaCalculada = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendientes.pending,  (state) => { state.loading = true })
      .addCase(fetchPendientes.fulfilled, (state, { payload }) => {
        state.loading    = false
        state.pendientes = payload.data
      })
      .addCase(fetchPendientes.rejected, (state, { error }) => {
        state.loading = false
        state.error   = error.message
      })
 
      .addCase(asignarConductor.pending,  (state) => { state.loading = true })
      .addCase(asignarConductor.fulfilled, (state, { payload }) => {
        state.loading       = false
        state.rutaCalculada = payload.data.ruta
        // Remover las órdenes asignadas de pendientes
        const asignadas = payload.data.ordenes.map(String)
        state.pendientes = state.pendientes.filter((o) => !asignadas.includes(String(o._id)))
      })
      .addCase(asignarConductor.rejected, (state, { error }) => {
        state.loading = false
        state.error   = error.message
      })
 
      .addCase(recalcularRuta.fulfilled, (state, { payload }) => {
        state.rutaCalculada = payload.data.ruta
      })
  },
})
 
export const { clearRuta } = despachoSlice.actions
export default despachoSlice.reducer