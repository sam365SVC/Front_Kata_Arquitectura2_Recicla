import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: { rol: 'user' },
    token: null,
    authenticated: true,  // DEV_MODE: siempre autenticado
    loading: false,
    error: null,
  },
  reducers: {
    // AUTH REAL Descomentar 
    // setCredentials(state, { payload }) {
    //   state.user          = payload.user
    //   state.token         = payload.token
    //   state.authenticated = true
    // },
    // logout(state) {
    //   state.user          = null
    //   state.token         = null
    //   state.authenticated = false
    // },
 
    // DEV_MODE: permite cambiar el rol para probar distintas vistas
    setDevRol(state, { payload }) {
      state.user.rol = payload
    },
  },
})
 
export const { setDevRol } = authSlice.actions
export const authReducer = authSlice.reducer