import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

export const fetchOrdenes = createAsyncThunk(
  'ordenes/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('ordenes', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)
 
export const fetchOrdenesParaMapa = createAsyncThunk(
  'ordenes/fetchMapa',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('ordenes/mapa')
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)
 
export const fetchOrdenById = createAsyncThunk(
  'ordenes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`ordenes/${id}`)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)
 
export const crearOrden = createAsyncThunk(
  'ordenes/crear',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post('ordenes', body)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)
 
export const cambiarEstadoOrden = createAsyncThunk(
  'ordenes/cambiarEstado',
  async ({ id, estado, nota }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`ordenes/${id}/estado`, { estado, nota })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)
 
export const cancelarOrden = createAsyncThunk(
  'ordenes/cancelar',
  async ({ id, motivo }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`ordenes/${id}`, { data: { motivo } })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)