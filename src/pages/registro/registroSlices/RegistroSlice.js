import { createSlice } from "@reduxjs/toolkit";
import {
  registrarClienteThunk,
  registrarTenantThunk,
  fetchTenantsDisponibles
} from "./RegistroThunk";

const mapTenantDisponible = (tenant) => ({

  id: tenant?.id_tenant ?? null,

  nombre: tenant?.nombre ?? "Sin nombre",

  plan: tenant?.plan ?? "Sin plan",

  estado: String(tenant?.estado ?? "").toLowerCase(),

  emailContacto: tenant?.email_contacto ?? "",

  telefono: tenant?.telefono ?? "",

  createdAt: tenant?.created_at ?? null,

  updatedAt: tenant?.updated_at ?? null,

  yaPertenece: Boolean(tenant?.ya_pertenece),

  estadoRelacion: tenant?.estado_relacion ?? null,

  raw: tenant,

});

const initialState = {
  items: [],
  total: 0,
  pagina: 1,
  totalPaginas: 1,
  error: null,
  success: false,
  registroLoading: false,
  isLoading: false,
};

const registroSlice = createSlice({
  name: "registro",
  initialState,
  reducers: {
    clearRegistroState: (state) => {
      state.registroLoading = false;
      state.error = null;
      state.success = false;
      state.items = [];
      state.total = 0;
      state.pagina = 1;
      state.totalPaginas = 1;
      state.isLoading = false;
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registrarClienteThunk.pending, (state) => {
        state.registroLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registrarClienteThunk.fulfilled, (state) => {
        state.registroLoading = false;
        state.success = true;
      })
      .addCase(registrarClienteThunk.rejected, (state, action) => {
        state.registroLoading = false;
        state.error = action.payload || "Error al registrar cliente";
      })

      .addCase(registrarTenantThunk.pending, (state) => {
        state.registroLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registrarTenantThunk.fulfilled, (state) => {
        state.registroLoading = false;
        state.success = true;
      })
      .addCase(registrarTenantThunk.rejected, (state, action) => {
        state.registroLoading = false;
        state.error = action.payload || "Error al registrar empresa";
      })
      .addCase(fetchTenantsDisponibles.pending, (state) => {

        state.isLoading = true;

        state.error = null;

      })

      .addCase(fetchTenantsDisponibles.fulfilled, (state, action) => {
  state.isLoading = false;

  state.items = Array.isArray(action.payload?.tenants)
    ? action.payload.tenants.map(mapTenantDisponible)
    : [];

  state.total = action.payload?.total ?? 0;
  state.pagina = action.payload?.pagina ?? 1;
  state.totalPaginas = action.payload?.totalPaginas ?? 1;
  state.error = null;

  console.log("FULFILLED PAYLOAD:", action.payload);
  console.log("STATE ITEMS EN SLICE:", state.items);
})

      .addCase(fetchTenantsDisponibles.rejected, (state, action) => {

        state.isLoading = false;

        state.error =

          action.payload || "Error al cargar empresas disponibles";

      }); 
  },
});

export const { clearRegistroState } = registroSlice.actions;
export default registroSlice.reducer;