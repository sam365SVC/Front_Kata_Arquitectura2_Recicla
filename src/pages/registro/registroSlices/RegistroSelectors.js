export const selectRegistroLoading = (state) =>
  state.registro?.registroLoading || false;

export const selectRegistroError = (state) =>
  state.registro?.error || null;

export const selectTenantsDisponibles = (state) =>
  state.registro?.items || [];

export const selectTenantsDisponiblesLoading = (state) =>
  state.registro?.isLoading || false;

export const selectTenantsDisponiblesTotal = (state) =>
  state.registro?.total || 0;

export const selectTenantsDisponiblesPagina = (state) =>
  state.registro?.pagina || 1;

export const selectTenantsDisponiblesTotalPaginas = (state) =>
  state.registro?.totalPaginas || 1;