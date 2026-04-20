import { createAsyncThunk as thunk } from '@reduxjs/toolkit'
import api from '../../lib/api'


export const fetchPendientes = thunk(
  'despacho/fetchPendientes',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('despacho/pendientes')
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)
 
export const asignarConductor = thunk(
  'despacho/asignar',
  async ({ conductorId, ordenIds }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('despacho/asignar', { conductorId, ordenIds })
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)
 
export const recalcularRuta = thunk(
  'despacho/recalcular',
  async ({ conductorId, posicionActual }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('despacho/ruta/recalcular', { conductorId, posicionActual })
      return data
    } catch (err) { return rejectWithValue(err.response?.data?.error || err.message) }
  }
)