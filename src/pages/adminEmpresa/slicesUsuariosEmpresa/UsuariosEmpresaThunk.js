import { usuariosEmpresaMock } from "../mock/data";
import {
  setUsuariosEmpresa,
  addUsuarioEmpresa,
  updateUsuarioEmpresa,
  toggleEstadoUsuarioEmpresa,
  setUsuariosEmpresaLoading,
  setUsuariosEmpresaError,
} from "./UsuariosEmpresaSlice";

const STORAGE_KEY = "adminEmpresa_usuarios";

const safeReadStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return usuariosEmpresaMock;

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return usuariosEmpresaMock;
    }

    return parsed;
  } catch (error) {
    return usuariosEmpresaMock;
  }
};

const safeWriteStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
};

export const fetchUsuariosEmpresa = () => async (dispatch) => {
  try {
    dispatch(setUsuariosEmpresaLoading(true));
    dispatch(setUsuariosEmpresaError(null));

    const usuarios = safeReadStorage();
    dispatch(setUsuariosEmpresa(usuarios));
  } catch (error) {
    dispatch(setUsuariosEmpresaError("No se pudo cargar la lista de usuarios."));
  } finally {
    dispatch(setUsuariosEmpresaLoading(false));
  }
};

export const createUsuarioEmpresa = (payload) => async (dispatch) => {
  try {
    dispatch(setUsuariosEmpresaLoading(true));
    dispatch(setUsuariosEmpresaError(null));

    const current = safeReadStorage();

    const nuevoUsuario = {
      id: `usr-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };

    const updated = [nuevoUsuario, ...current];
    const ok = safeWriteStorage(updated);

    if (!ok) {
      throw new Error("No se pudo guardar el usuario.");
    }

    dispatch(addUsuarioEmpresa(nuevoUsuario));
  } catch (error) {
    dispatch(
      setUsuariosEmpresaError(
        error?.message || "No se pudo crear el usuario."
      )
    );
  } finally {
    dispatch(setUsuariosEmpresaLoading(false));
  }
};

export const editUsuarioEmpresa = (payload) => async (dispatch) => {
  try {
    dispatch(setUsuariosEmpresaLoading(true));
    dispatch(setUsuariosEmpresaError(null));

    const current = safeReadStorage();

    const updated = current.map((user) =>
      user.id === payload.id ? { ...user, ...payload } : user
    );

    const ok = safeWriteStorage(updated);

    if (!ok) {
      throw new Error("No se pudo actualizar el usuario.");
    }

    dispatch(updateUsuarioEmpresa(payload));
  } catch (error) {
    dispatch(
      setUsuariosEmpresaError(
        error?.message || "No se pudo editar el usuario."
      )
    );
  } finally {
    dispatch(setUsuariosEmpresaLoading(false));
  }
};

export const changeEstadoUsuarioEmpresa = (userId) => async (dispatch) => {
  try {
    dispatch(setUsuariosEmpresaLoading(true));
    dispatch(setUsuariosEmpresaError(null));

    const current = safeReadStorage();

    const updated = current.map((user) =>
      user.id === userId
        ? {
            ...user,
            estado: user.estado === "Activo" ? "Inactivo" : "Activo",
          }
        : user
    );

    const ok = safeWriteStorage(updated);

    if (!ok) {
      throw new Error("No se pudo actualizar el estado.");
    }

    dispatch(toggleEstadoUsuarioEmpresa(userId));
  } catch (error) {
    dispatch(
      setUsuariosEmpresaError(
        error?.message || "No se pudo cambiar el estado del usuario."
      )
    );
  } finally {
    dispatch(setUsuariosEmpresaLoading(false));
  }
};