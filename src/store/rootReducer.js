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

import checkoutReducer from '../pages/checkoutPago/slicesCheckout/CheckoutSlice';


import planEmpresaReducer from '../pages/adminEmpresa/slicesPlanEmpresa/PlanEmpresaSlice';


//para cotizaciones y tipo de dispositivos
// nivel inicial, posible actualizacion
import cotizacionesReducer from '../pages/adminUsuarioFinal/slicesCotizaciones/CotizacionesSlice';
import cotizacionesTenantReducer from '../pages/adminEmpresa/slicesCotizaciones/CotizacionesSlice';
import tiposDispositivoReducer from '../pages/adminUsuarioFinal/slicesTiposDispositivo/TiposDispositivoSlice';
import usuariosEmpresaReducer from '../pages/adminEmpresa/slicesUsuariosEmpresa/UsuariosEmpresaSlice';
import tiposDispositivoEmpresaReducer from '../pages/adminEmpresa/slicesTiposDispositivoEmpresa/TiposDispositivoEmpresaSlice';
import inspeccionesReducer from '../pages/inspector/slicesInspecciones/InspeccionesSlice';
import planesReducer from '../pages/planesPagos/slicesPlanes/PlanSlice';
import registroSliceReducer from '../pages/registro/registroSlices/RegistroSlice';
import activarEmpleadoReducer from '../pages/registroEmpleado/empleadoSlices/RegistroEmpleadoSlices';
import tenantReducer from '../pages/adminSaas/slicesEmpresas/EmpresaSlices';
import reportesReducer from '../pages/adminEmpresa/slicesReportes/ReportesSlice'
import ingresosReducer from '../pages/adminSaas/slicesIngresos/IngresosSlices'; 
import cotizacionPagosReducer from '../pages/adminEmpresa/slicesCotizaciones/CotizacionesSlice';

import saldoReducer from '../pages/adminUsuarioFinal/slicesSaldo/saldoSlice'
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

  //COTIZACIONES POR EL CLIENTE 
  cotizacionesTenant: cotizacionesTenantReducer,

    // admin empresa
  usuariosEmpresa: usuariosEmpresaReducer,
  tiposDispositivoEmpresa: tiposDispositivoEmpresaReducer,

  //PARA EL INSPECTOR
  inspecciones: inspeccionesReducer,

  planes :planesReducer,
  planEmpresa: planEmpresaReducer,
  checkout: checkoutReducer,
  registro: registroSliceReducer,
  activarEmpleado: activarEmpleadoReducer,
  tenants: tenantReducer,
  reportes: reportesReducer,
  ingresos: ingresosReducer,
  cotizacionPagos: cotizacionPagosReducer,
  saldo: saldoReducer,
});

export default rootReducer;