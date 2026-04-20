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