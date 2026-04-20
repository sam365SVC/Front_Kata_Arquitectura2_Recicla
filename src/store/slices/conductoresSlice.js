import { createSlice } from '@reduxjs/toolkit'
import {
  fetchConductores, crearConductor, actualizarConductor,
  toggleDisponibilidad, desactivarConductor,
} from '../thunks/conductoresThunks'

const initialState = {
  lista: [],
  posicionesGPS: {},   // { [conductorId]: { lat, lng, velocidad, timestamp } }
  selected: null,
  loading: false,
  error: null,
}

const conductoresSlice = createSlice({
  name: 'conductores',
  initialState,
  reducers: {
    clearSelected(state) { state.selected = null },

    // Llamado desde SocketContext cuando llega 'gps:conductor'
    updateGPSConductor(state, action) {
      const { conductorId, lat, lng, velocidad, timestamp } = action.payload
      state.posicionesGPS[conductorId] = { lat, lng, velocidad, timestamp, online: true }
    },

    // Llamado desde SocketContext cuando llega 'conductor:offline'
    setConductorOffline(state, action) {
      const id = action.payload
      if (state.posicionesGPS[id]) {
        state.posicionesGPS[id].online = false
      }
    },

    // Carga todas las posiciones desde 'gps:todas'
    setPosicionesGPS(state, action) {
      const posiciones = action.payload
      state.posicionesGPS = {}
      posiciones.forEach((p) => {
        state.posicionesGPS[p.conductorId] = { ...p, online: true }
      })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConductores.pending,  (state) => { state.loading = true; state.error = null })
      .addCase(fetchConductores.fulfilled, (state, { payload }) => {
        state.loading = false
        state.lista   = payload.data
      })
      .addCase(fetchConductores.rejected, (state, { error }) => {
        state.loading = false
        state.error   = error.message
      })

      .addCase(crearConductor.fulfilled, (state, { payload }) => {
        state.lista.unshift(payload.data)
      })

      .addCase(actualizarConductor.fulfilled, (state, { payload }) => {
        const idx = state.lista.findIndex((c) => c._id === payload.data._id)
        if (idx !== -1) state.lista[idx] = payload.data
      })

      .addCase(toggleDisponibilidad.fulfilled, (state, { payload }) => {
        const idx = state.lista.findIndex((c) => c._id === payload.data._id)
        if (idx !== -1) state.lista[idx].disponible = payload.data.disponible
      })

      .addCase(desactivarConductor.fulfilled, (state, { payload }) => {
        const idx = state.lista.findIndex((c) => c._id === payload.data._id)
        if (idx !== -1) state.lista[idx].activo = false
      })
  },
})

export const { clearSelected, updateGPSConductor, setConductorOffline, setPosicionesGPS } = conductoresSlice.actions
export default conductoresSlice.reducer