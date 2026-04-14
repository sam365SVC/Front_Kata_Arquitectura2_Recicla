import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import loginReducer from '../pages/signin/slices/loginSlice';

// logistica
import conductoresReducer from './slices/conductoresSlice';
import ubicacionesReducer from './slices/ubicacionesSlice';
import despachoReducer from './slices/despachoSlice';
import ordenesReducer from './slices/ordenesSlice';
import { authReducer }    from './slices/authSlice'; 


//para cotizaciones y tipo de dispositivos
// nivel inicial, posible actualizacion
import cotizacionesReducer from '../pages/adminUsuarioFinal/slicesCotizaciones/CotizacionesSlice';
import tiposDispositivoReducer from '../pages/adminUsuarioFinal/slicesTiposDispositivo/TiposDispositivoSlice';
const loginPersistConfig = {
  key: 'login',
  storage,
  whitelist: ['user'],
};

export const rootReducer = combineReducers({
  login: persistReducer(loginPersistConfig, loginReducer),
  //logistica
  auth: authReducer,
  conductores: conductoresReducer,
  ubicaciones: ubicacionesReducer,
  despacho: despachoReducer,
  ordenes: ordenesReducer,

  //COTIZACIONES POR EL CLIENTE 
  cotizaciones: cotizacionesReducer,
  tiposDispositivo: tiposDispositivoReducer,
});

export default rootReducer;