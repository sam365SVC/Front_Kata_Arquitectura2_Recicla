export const selectUser = (state) => state.login.user;
export const selectIsLoading = (state) => state.login.isLoading;
export const selectError = (state) => state.login.error;

export const selectTenantOptions = (state) => state.login.tenantOptions;
export const selectNeedsTenantSelection = (state) =>
  state.login.needsTenantSelection;
export const selectPendingCredentials = (state) =>
  state.login.pendingCredentials;

export const selectUserId = (state) => state.login.user?.id ?? null;
export const selectToken = (state) => state.login.user?.token ?? null;
export const selectUserRole = (state) => state.login.user?.rol ?? null;
export const selectTenantId = (state) => state.login.user?.tenantId ?? null;
export const selectTenantName = (state) =>
  state.login.user?.tenantNombre ?? "";

export const selectIsSuperAdmin = (state) =>
  state.login.user?.rol === "SUPERADMIN";

export const selectIsAdminTenant = (state) =>
  state.login.user?.rol === "ADMIN_TENANT";

export const selectIsAdminLogistica = (state) =>
  state.login.user?.rol === "ADMIN_LOGISTICA";

export const selectIsDespachador = (state) =>
  state.login.user?.rol === "DESPACHADOR";

export const selectIsInspector = (state) =>
  state.login.user?.rol === "INSPECTOR";

export const selectIsConductor = (state) =>
  state.login.user?.rol === "CONDUCTOR";

export const selectIsCliente = (state) =>
  state.login.user?.rol === "CLIENTE";

export const selectIsAuthenticated = (state) => {
  const token = state.login.user?.token;
  const id = state.login.user?.id;
  const expiresAt = state.login.user?.expiresAt;

  if (!token || !id) return false;
  if (expiresAt && Date.now() > expiresAt) return false;

  return true;
};