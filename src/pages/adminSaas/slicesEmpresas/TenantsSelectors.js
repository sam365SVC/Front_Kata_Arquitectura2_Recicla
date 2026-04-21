export const selectTenants = (state) => state.tenants?.items || [];
export const selectTenantsLoading = (state) => state.tenants?.isLoading || false;
export const selectTenantsError = (state) => state.tenants?.error || null;
export const selectTenantsTotal = (state) => state.tenants?.total || 0;
export const selectTenantsPagina = (state) => state.tenants?.pagina || 1;
export const selectTenantsTotalPaginas = (state) => state.tenants?.totalPaginas || 1;