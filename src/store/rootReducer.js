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
// admin
//import studentsReducer from '../pages/admin/slicesStudents/StudentsSlice';
//import docentesReducer from '../pages/admin/slicesDocentes/DocentesSlice';
//import cursoReducer from '../pages/admin/slicesCursos/CursosSlice';
import pagosReducer from '../pages/checkoutPago/slicesPagos/PagosSlice';
import checkoutReducer from '../pages/checkoutPago/slicesCheckout/CheckoutSlice';
// admin estudiantes
import perfilReducer from '../pages/adminEstudiantes/slicesPerfil/PerfilSlice';
import carritoReducer from '../pages/adminEstudiantes/slicesCarrito/CarritoSlice';
import ofertaAcademicaReducer from '../pages/adminEstudiantes/slicesOfertaAcademica/OfertaAcademicaSlice';
import cursosEstudianteReducer from '../pages/adminEstudiantes/slicesCursos/CursosSlice';
//import checkoutReducer from '../pages/adminEstudiantes/slicesCheckout/CheckoutSlice';

// admin docentes
import perfilDocenteReducer from '../pages/adminDocentes/slicesPerfilDocente/PerfilDocenteSlice';
// para que el estudiante vea su historial de saldos
import saldosMovimientosReducer from '../pages/adminEstudiantes/slicesSaldo/SaldosMovimientosSlice';
import cursosDocenteReducer from '../pages/adminDocentes/slicesCursos/CursosSlices';
import notasDocenteReducer from '../pages/adminDocentes/slicesNotas/NotasSlices';
import planEmpresaReducer from '../pages/adminEmpresa/slicesPlanEmpresa/PlanEmpresaSlice';


//para cotizaciones y tipo de dispositivos
// nivel inicial, posible actualizacion
import cotizacionesReducer from '../pages/adminUsuarioFinal/slicesCotizaciones/CotizacionesSlice';
import tiposDispositivoReducer from '../pages/adminUsuarioFinal/slicesTiposDispositivo/TiposDispositivoSlice';
import usuariosEmpresaReducer from '../pages/adminEmpresa/slicesUsuariosEmpresa/UsuariosEmpresaSlice';
import tiposDispositivoEmpresaReducer from '../pages/adminEmpresa/slicesTiposDispositivoEmpresa/TiposDispositivoEmpresaSlice';
import inspeccionesReducer from '../pages/inspector/slicesInspecciones/InspeccionesSlice';
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
    // admin empresa
  usuariosEmpresa: usuariosEmpresaReducer,
  tiposDispositivoEmpresa: tiposDispositivoEmpresaReducer,

  //PARA EL INSPECTOR
  inspecciones: inspeccionesReducer,

  planEmpresa: planEmpresaReducer,
  checkout: checkoutReducer,
});

export default rootReducer;