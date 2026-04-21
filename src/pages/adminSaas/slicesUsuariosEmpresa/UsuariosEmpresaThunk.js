import { empresasApi } from "../../../lib/api";
import {
  setUsuariosEmpresa,
  addUsuarioEmpresa,
  updateUsuarioEmpresa,
  removeUsuarioEmpresa,
  setUsuariosEmpresaLoading,
  setUsuariosEmpresaError,
} from "./UsuariosEmpresaSlice";

const normalizeText = (value) => String(value || "").trim();

const buildNombreCompleto = (nombre, apellido) =>
  [nombre, apellido].filter(Boolean).join(" ").trim();

const mapRolToFrontend = (rol = "") => {
  const roleMap = {
    ADMIN_LOGISTICA: "Administrador logística",
    DESPACHADOR: "Despachador",
    INSPECTOR: "Inspector",
    CONDUCTOR: "Conductor",
    ADMIN_TENANT: "Administrador",
    SUPERADMIN: "Superadmin",
    CLIENTE: "Cliente",
  };

  return roleMap[rol] || rol || "Sin rol";
};

const mapRolToBackend = (rol = "") => {
  const roleMap = {
    "Administrador logística": "ADMIN_LOGISTICA",
    Despachador: "DESPACHADOR",
    Inspector: "INSPECTOR",
    Conductor: "CONDUCTOR",
    ADMIN_LOGISTICA: "ADMIN_LOGISTICA",
    DESPACHADOR: "DESPACHADOR",
    INSPECTOR: "INSPECTOR",
    CONDUCTOR: "CONDUCTOR",
  };

  return roleMap[rol] || rol;
};

const mapUsuarioEmpresa = (user) => {
  const id = user?.id || user?.id_usuario || user?.usuario_id || "";
  const nombre = normalizeText(user?.nombre);
  const apellido = normalizeText(user?.apellido);
  const email = normalizeText(user?.email);
  const rolBackend = normalizeText(user?.rol);
  const estadoBackend = normalizeText(user?.estado).toLowerCase();

  return {
    id,
    nombre: buildNombreCompleto(nombre, apellido) || "Sin nombre",
    nombreRaw: nombre,
    apellidoRaw: apellido,
    email,
    rol: mapRolToFrontend(rolBackend),
    rolBackend,
    estado: estadoBackend === "activo" ? "Activo" : "Inactivo",
    createdAt: user?.creado_en || user?.created_at || null,
    raw: user,
  };
};

export const fetchUsuariosEmpresa = () => async (dispatch) => {
  try {
    dispatch(setUsuariosEmpresaLoading(true));
    dispatch(setUsuariosEmpresaError(null));

    const response = await empresasApi.fetchUsuariosEmpresaByTenantId();

    const usuarios = Array.isArray(response?.usuarios)
      ? response.usuarios
      : Array.isArray(response)
      ? response
      : [];

    const mapped = usuarios.map(mapUsuarioEmpresa);

    dispatch(setUsuariosEmpresa(mapped));
  } catch (error) {
    dispatch(
      setUsuariosEmpresaError(
        error?.message || "No se pudo cargar la lista de usuarios."
      )
    );
  } finally {
    dispatch(setUsuariosEmpresaLoading(false));
  }
};

export const createUsuarioEmpresa = (payload) => async (dispatch) => {
  try {
    dispatch(setUsuariosEmpresaLoading(true));
    dispatch(setUsuariosEmpresaError(null));

    const body = {
      email: normalizeText(payload?.email).toLowerCase(),
      nombre: normalizeText(payload?.nombre),
      apellido: normalizeText(payload?.apellido),
      rol: mapRolToBackend(payload?.rol),
    };

    const response = await empresasApi.createUsuarioEmpresa(body);

    const invitacion = response?.invitacion || body;

    dispatch(
      addUsuarioEmpresa(
        mapUsuarioEmpresa({
          id_usuario: `tmp-${Date.now()}`,
          nombre: invitacion.nombre,
          apellido: invitacion.apellido,
          email: invitacion.email,
          rol: invitacion.rol,
          estado: "activo",
          creado_en: new Date().toISOString(),
        })
      )
    );

    return { ok: true, data: response };
  } catch (error) {
    const message = error?.message || "No se pudo invitar al usuario.";

    dispatch(setUsuariosEmpresaError(message));

    return { ok: false, message };
  } finally {
    dispatch(setUsuariosEmpresaLoading(false));
  }
};

export const editUsuarioEmpresa = (payload) => async (dispatch) => {
  try {
    dispatch(setUsuariosEmpresaLoading(true));
    dispatch(setUsuariosEmpresaError(null));

    const body = {
      nombre: normalizeText(payload?.nombre),
      apellido: normalizeText(payload?.apellido),
    };

    const response = await empresasApi.updateUsuarioEmpresa(payload.id, body);

    const usuarioActualizado = response?.usuario || {
      id_usuario: payload.id,
      nombre: body.nombre,
      apellido: body.apellido,
      email: payload.email,
      rol: payload.rolBackend || mapRolToBackend(payload.rol),
      estado: payload.estado === "Activo" ? "activo" : "inactivo",
      creado_en: payload.createdAt || null,
    };

    dispatch(updateUsuarioEmpresa(mapUsuarioEmpresa(usuarioActualizado)));

    return { ok: true, data: response };
  } catch (error) {
    const message = error?.message || "No se pudo editar el usuario.";

    dispatch(setUsuariosEmpresaError(message));

    return { ok: false, message };
  } finally {
    dispatch(setUsuariosEmpresaLoading(false));
  }
};

export const changeEstadoUsuarioEmpresa = (userId) => async (dispatch) => {
  try {
    dispatch(setUsuariosEmpresaLoading(true));
    dispatch(setUsuariosEmpresaError(null));

    const response = await empresasApi.changeEstadoUsuarioEmpresa(userId);

    dispatch(removeUsuarioEmpresa(userId));

    return { ok: true, data: response };
  } catch (error) {
    const message = error?.message || "No se pudo desactivar el usuario.";

    dispatch(setUsuariosEmpresaError(message));

    return { ok: false, message };
  } finally {
    dispatch(setUsuariosEmpresaLoading(false));
  }
};