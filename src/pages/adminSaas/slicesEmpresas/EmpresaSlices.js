import { createSlice } from "@reduxjs/toolkit";
import { fetchAllTenants } from "./EmpresaThunk";

const mapTenant = (tenant) => ({
  id: tenant?.id_tenant ?? "",
  nombre: tenant?.nombre ?? "Sin nombre",
  plan: tenant?.plan ?? "Sin plan",
  estado: String(tenant?.estado ?? "").toLowerCase(),
  emailContacto: tenant?.email_contacto ?? "",
  telefono: tenant?.telefono ?? "",
  isDeleted: Boolean(tenant?.is_deleted),
  createdAt: tenant?.created_at ?? null,
  updatedAt: tenant?.updated_at ?? null,
  raw: tenant,
});

const initialState = {
  items: [],
  total: 0,
  pagina: 1,
  totalPaginas: 1,
  isLoading: false,
  error: null,
};

const tenantsSlice = createSlice({
  name: "tenants",
  initialState,
  reducers: {
    clearTenantsError: (state) => {
      state.error = null;
    },
    clearTenantsState: (state) => {
      state.items = [];
      state.total = 0;
      state.pagina = 1;
      state.totalPaginas = 1;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTenants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTenants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload?.tenants)
          ? action.payload.tenants.map(mapTenant)
          : [];
        state.total = action.payload?.total ?? 0;
        state.pagina = action.payload?.pagina ?? 1;
        state.totalPaginas = action.payload?.totalPaginas ?? 1;
        state.error = null;

        console.log("slice items:", state.items);
      })
      .addCase(fetchAllTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Error al cargar empresas";
      });
  },
});

export const { clearTenantsError, clearTenantsState } = tenantsSlice.actions;
export default tenantsSlice.reducer;