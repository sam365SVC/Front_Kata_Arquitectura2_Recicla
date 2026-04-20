import { createSlice } from '@reduxjs/toolkit'
import { fetchUbicaciones, crearUbicacion, actualizarCapacidad } from '../thunks/ubicacionesThunks'

const ubicacionesSlice = createSlice({
  name: 'ubicaciones',
  initialState: { lista: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUbicaciones.pending,  (state) => { state.loading = true })
      .addCase(fetchUbicaciones.fulfilled, (state, { payload }) => {
        state.loading = false
        state.lista   = payload.data
      })
      .addCase(fetchUbicaciones.rejected, (state, { error }) => {
        state.loading = false
        state.error   = error.message
      })
      .addCase(crearUbicacion.fulfilled, (state, { payload }) => {
        state.lista.push(payload.data)
      })
      .addCase(actualizarCapacidad.fulfilled, (state, { payload }) => {
        const idx = state.lista.findIndex((u) => u._id === payload.data._id)
        if (idx !== -1) {
          state.lista[idx].capacidadActual = payload.data.capacidadActual
          state.lista[idx].ocupacionPct    = payload.data.ocupacionPct
        }
      })
  },
})

export default ubicacionesSlice.reducer