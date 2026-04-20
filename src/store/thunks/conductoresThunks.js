import { createAsyncThunk as thunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

export const fetchConductores = thunk(
  'conductores/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('conductores', { params })
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)
 
export const crearConductor = thunk(
  'conductores/crear',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post('conductores', body)
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)
 
export const actualizarConductor = thunk(
  'conductores/actualizar',
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`conductores/${id}`, body)
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)
 
export const toggleDisponibilidad = thunk(
  'conductores/toggleDisponibilidad',
  async ({ id, disponible }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`conductores/${id}/disponibilidad`, { disponible })
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)
 
export const desactivarConductor = thunk(
  'conductores/desactivar',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`conductores/${id}`)
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)