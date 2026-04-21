export const selectActivarEmpleadoLoading = (state) =>
  state.activarEmpleado?.isLoading;

export const selectActivarEmpleadoError = (state) =>
  state.activarEmpleado?.error;

export const selectActivarEmpleadoSuccess = (state) =>
  state.activarEmpleado?.success;

export const selectActivarEmpleadoData = (state) =>
  state.activarEmpleado?.data;