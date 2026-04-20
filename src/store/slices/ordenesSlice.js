
import { createSlice } from '@reduxjs/toolkit'
import { fetchOrdenes, fetchOrdenById, crearOrden, cambiarEstadoOrden, cancelarOrden } from '../thunks/ordenesThunks'

const initialState = {
  lista: [],
  mapa: [],   // órdenes activas con coordenadas para el mapa
  selected:null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
}

const ordenesSlice = createSlice({
  name: 'ordenes',
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload
    },
    clearSelected(state) {
      state.selected = null
    },
    // Llamado desde el socket cuando un waypoint se completa
    updateWaypoint(state, action) {
      const { ordenId, waypointIndex } = action.payload
      const orden = state.lista.find((o) => o._id === ordenId) || state.selected
      if (orden?.ruta?.waypoints?.[waypointIndex]) {
        orden.ruta.waypoints[waypointIndex].completado = true
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOrdenes
      .addCase(fetchOrdenes.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchOrdenes.fulfilled, (state, { payload }) => {
        state.loading = false
        state.lista   = payload.data
        state.total   = payload.total
      })
      .addCase(fetchOrdenes.rejected, (state, { error }) => {
        state.loading = false
        state.error   = error.message
      })

      // fetchOrdenById
      .addCase(fetchOrdenById.fulfilled, (state, { payload }) => {
        state.selected = payload.data
      })

      // crearOrden
      .addCase(crearOrden.fulfilled, (state, { payload }) => {
        state.lista.unshift(payload.data)
        state.total += 1
      })

      // cambiarEstadoOrden
      .addCase(cambiarEstadoOrden.fulfilled, (state, { payload }) => {
        const idx = state.lista.findIndex((o) => o._id === payload.data._id)
        if (idx !== -1) state.lista[idx] = payload.data
        if (state.selected?._id === payload.data._id) state.selected = payload.data
      })

      // cancelarOrden
      .addCase(cancelarOrden.fulfilled, (state, { payload }) => {
        const idx = state.lista.findIndex((o) => o._id === payload.data._id)
        if (idx !== -1) state.lista[idx] = payload.data
      })
  },
})

export const { setPage, clearSelected, updateWaypoint } = ordenesSlice.actions
export default ordenesSlice.reducer