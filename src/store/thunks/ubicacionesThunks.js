import { createAsyncThunk as thunk } from '@reduxjs/toolkit'
import api from '../../lib/api'


export const fetchUbicaciones = thunk(
  'ubicaciones/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('ubicaciones', { params })
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)
 
export const crearUbicacion = thunk(
  'ubicaciones/crear',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post('ubicaciones', body)
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)
 
export const actualizarCapacidad = thunk(
  'ubicaciones/actualizarCapacidad',
  async ({ id, capacidadActual }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`ubicaciones/${id}/capacidad`, { capacidadActual })
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)

export const actualizarUbicacion = thunk(
  'ubicaciones/actualizar',
  async ({ id, nombre, tipo, direccion, referencia, lat, lng, capacidadMaxima, horario, contacto, notas, activo }, { rejectWithValue }) => {
    try {
      const body = { nombre, tipo, direccion, referencia, capacidadMaxima, horario, contacto, notas, activo }
      if (lat && lng) { body.lat = lat; body.lng = lng }
      const { data } = await api.put(`ubicaciones/${id}`, body)
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)