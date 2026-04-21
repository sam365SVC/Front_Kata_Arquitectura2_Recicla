import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "auth_user_v1";

function getEmptyUser() {
  return {
    id: null,
    mail: "",
    nombres: "",
    rol: "",
    token: null,
    tenantId: null,
    tenantNombre: "",
    expiresAt: null,
  };
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const user = JSON.parse(raw);

    if (user?.expiresAt && Date.now() > user.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

function saveStoredUser(user) {
  try {
    if (!user || !user.token) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

const storedUser = loadStoredUser();

const initialState = {
  user: storedUser || getEmptyUser(),
  isLoading: false,
  error: null,
  tenantOptions: [],
  needsTenantSelection: false,
  pendingCredentials: null,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout(state) {
      state.user = getEmptyUser();
      state.isLoading = false;
      state.error = null;
      state.tenantOptions = [];
      state.needsTenantSelection = false;
      state.pendingCredentials = null;
      saveStoredUser(null);
    },
    clearError(state) {
      state.error = null;
    },
    clearTenantSelection(state) {
      state.tenantOptions = [];
      state.needsTenantSelection = false;
      state.pendingCredentials = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase("login/loginUser/pending", (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase("login/loginUser/fulfilled", (state, action) => {
        state.isLoading = false;
        state.error = null;

        if (action.payload?.needsTenantSelection) {
          state.tenantOptions = action.payload.tenants || [];
          state.needsTenantSelection = true;
          state.pendingCredentials = action.payload.pendingCredentials || null;
          return;
        }

        state.user = action.payload;
        state.tenantOptions = [];
        state.needsTenantSelection = false;
        state.pendingCredentials = null;
        saveStoredUser(action.payload);
      })
      .addCase("login/loginUser/rejected", (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "No se pudo iniciar sesión.";
      })

      .addCase("login/renewSession/pending", (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase("login/renewSession/fulfilled", (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload;
        saveStoredUser(action.payload);
      })
      .addCase("login/renewSession/rejected", (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
        state.user = getEmptyUser();
        saveStoredUser(null);
      });
  },
});

export const { logout, clearError, clearTenantSelection } = loginSlice.actions;
export default loginSlice.reducer;