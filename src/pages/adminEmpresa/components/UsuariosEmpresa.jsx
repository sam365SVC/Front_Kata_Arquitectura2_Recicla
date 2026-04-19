import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiPower,
  FiMail,
  FiPhone,
  FiUsers,
  FiShield,
} from "react-icons/fi";
import styles from "./UsuariosEmpresa.module.scss";
import UsuarioEmpresaModal from "./UsuarioEmpresaModal";
import { usuariosEmpresaMock } from "../mock/data";

const STORAGE_KEY = "adminEmpresa_usuarios";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const normalizeUser = (usuario, index = 0) => ({
  id: usuario?.id?.toString?.() || `USR-${String(index + 1).padStart(4, "0")}`,
  nombre: usuario?.nombre || "",
  email: usuario?.email || "",
  telefono: usuario?.telefono || "+591 ",
  cargo: usuario?.cargo || "Operador de recepción",
  rol: usuario?.rol || "Operador",
  area: usuario?.area || "Operaciones",
  estado: usuario?.estado === "Inactivo" ? "Inactivo" : "Activo",
  password: usuario?.password || "",
  createdAt: usuario?.createdAt || new Date().toISOString(),
  passwordUpdatedAt: usuario?.passwordUpdatedAt || null,
});

const getInitialUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return usuariosEmpresaMock.map((item, index) => normalizeUser(item, index));
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return usuariosEmpresaMock.map((item, index) => normalizeUser(item, index));
    }

    return parsed.map((item, index) => normalizeUser(item, index));
  } catch (error) {
    console.error("Error leyendo usuarios desde localStorage:", error);
    return usuariosEmpresaMock.map((item, index) => normalizeUser(item, index));
  }
};

const buildSwalClasses = () => ({
  popup: styles.swalPopup,
  title: styles.swalTitle,
  htmlContainer: styles.swalText,
  confirmButton: styles.swalConfirm,
  cancelButton: styles.swalCancel,
});

const UsuariosEmpresa = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const initialUsers = getInitialUsers();
    setUsuarios(initialUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    const query = normalizeText(search);

    return usuarios.filter((usuario) => {
      const matchesSearch =
        !query ||
        normalizeText(usuario.nombre).includes(query) ||
        normalizeText(usuario.email).includes(query) ||
        normalizeText(usuario.cargo).includes(query) ||
        normalizeText(usuario.rol).includes(query) ||
        normalizeText(usuario.area).includes(query);

      const matchesEstado =
        estadoFiltro === "Todos" || usuario.estado === estadoFiltro;

      return matchesSearch && matchesEstado;
    });
  }, [usuarios, search, estadoFiltro]);

  const resumen = useMemo(() => {
    const activos = usuarios.filter((u) => u.estado === "Activo").length;
    const inactivos = usuarios.filter((u) => u.estado === "Inactivo").length;
    const admins = usuarios.filter(
      (u) => normalizeText(u.rol) === "administrador"
    ).length;

    return {
      total: usuarios.length,
      activos,
      inactivos,
      admins,
    };
  }, [usuarios]);

  const openCreateModal = () => {
    setSelectedUser(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (usuario) => {
    setSelectedUser(usuario);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const showSuccessAlert = async ({
    title,
    text,
    confirmText = "Entendido",
  }) => {
    await Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: confirmText,
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });
  };

  const handleSubmitUser = async (payload, { isEditMode, changePassword }) => {
    if (isEditMode) {
      const usuarioAnterior = usuarios.find((item) => item.id === payload.id);

      setUsuarios((prev) =>
        prev.map((item) => {
          if (item.id !== payload.id) return item;

          const updated = {
            ...item,
            nombre: payload.nombre,
            email: payload.email,
            telefono: payload.telefono,
            cargo: payload.cargo,
            rol: payload.rol,
            area: payload.area,
            estado: payload.estado,
          };

          if (changePassword && payload.password) {
            updated.password = payload.password;
            updated.passwordUpdatedAt = new Date().toISOString();
          }

          return normalizeUser(updated);
        })
      );

      closeModal();

      await showSuccessAlert({
        title: "Usuario actualizado",
        text: `Los datos de ${usuarioAnterior?.nombre || "este usuario"} se guardaron correctamente.`,
        confirmText: "Perfecto",
      });

      return;
    }

    const nuevoUsuario = normalizeUser({
      id: `USR-${Date.now()}`,
      nombre: payload.nombre,
      email: payload.email,
      telefono: payload.telefono,
      cargo: payload.cargo,
      rol: payload.rol,
      area: payload.area,
      estado: payload.estado,
      password: payload.password,
      createdAt: new Date().toISOString(),
    });

    setUsuarios((prev) => [nuevoUsuario, ...prev]);
    closeModal();

    await showSuccessAlert({
      title: "Usuario creado",
      text: `${nuevoUsuario.nombre} fue agregado correctamente a la empresa.`,
      confirmText: "Continuar",
    });
  };

  const toggleEstadoUsuario = async (usuario) => {
    const accion =
      usuario.estado === "Activo" ? "desactivar" : "activar";
    const siguienteEstado =
      usuario.estado === "Activo" ? "Inactivo" : "Activo";

    const result = await Swal.fire({
      icon: "warning",
      title:
        usuario.estado === "Activo"
          ? "¿Desactivar usuario?"
          : "¿Activar usuario?",
      html: `
        <div>
          Se va a <b>${accion}</b> a <b>${usuario.nombre}</b>.<br/>
          El estado cambiará a <b>${siguienteEstado}</b>.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText:
        usuario.estado === "Activo" ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });

    if (!result.isConfirmed) return;

    setUsuarios((prev) =>
      prev.map((item) =>
        item.id === usuario.id
          ? normalizeUser({
              ...item,
              estado: siguienteEstado,
            })
          : item
      )
    );

    await showSuccessAlert({
      title:
        siguienteEstado === "Activo"
          ? "Usuario activado"
          : "Usuario desactivado",
      text: `${usuario.nombre} ahora se encuentra ${siguienteEstado.toLowerCase()}.`,
      confirmText: "Entendido",
    });
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.hero}>
        <div>
          <span className={styles.hero__eyebrow}>Gestión interna</span>
          <h2>Usuarios de la empresa</h2>
          <p>
            Administra empleados, roles, accesos y estados dentro del panel de
            la empresa.
          </p>
        </div>

        <button type="button" className={styles.primaryButton} onClick={openCreateModal}>
          <FiPlus size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiUsers size={18} />
          </div>
          <div>
            <strong>{resumen.total}</strong>
            <span>Total de usuarios</span>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiShield size={18} />
          </div>
          <div>
            <strong>{resumen.admins}</strong>
            <span>Administradores</span>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiPower size={18} />
          </div>
          <div>
            <strong>{resumen.activos}</strong>
            <span>Usuarios activos</span>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiPower size={18} />
          </div>
          <div>
            <strong>{resumen.inactivos}</strong>
            <span>Usuarios inactivos</span>
          </div>
        </article>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, cargo, rol o área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="Todos">Todos</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Listado de usuarios</h3>
            <span>
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Cargo</th>
                <th>Rol</th>
                <th>Área</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((usuario) => {
                const iniciales = usuario.nombre
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((item) => item[0])
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={usuario.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{iniciales || "U"}</div>
                        <div className={styles.userMeta}>
                          <strong>{usuario.nombre}</strong>
                          <span>{usuario.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className={styles.contactBlock}>
                        <span>
                          <FiMail size={13} />
                          {usuario.email || "Sin correo"}
                        </span>
                        <span>
                          <FiPhone size={13} />
                          {usuario.telefono || "Sin teléfono"}
                        </span>
                      </div>
                    </td>

                    <td>{usuario.cargo || "Sin cargo"}</td>

                    <td>
                      <span className={styles.roleBadge}>
                        {usuario.rol || "Operador"}
                      </span>
                    </td>

                    <td>{usuario.area || "Operaciones"}</td>

                    <td>
                      <span
                        className={`${styles.badge} ${
                          usuario.estado === "Activo"
                            ? styles.badgeActive
                            : styles.badgeInactive
                        }`}
                      >
                        {usuario.estado}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => openEditModal(usuario)}
                        >
                          <FiEdit2 size={14} />
                          Editar
                        </button>

                        <button
                          type="button"
                          className={`${styles.actionButton} ${
                            usuario.estado === "Activo"
                              ? styles.actionDanger
                              : styles.actionSuccess
                          }`}
                          onClick={() => toggleEstadoUsuario(usuario)}
                        >
                          <FiPower size={14} />
                          {usuario.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className={styles.emptyTable}>
                      <h4>No se encontraron usuarios</h4>
                      <p>
                        Prueba cambiando la búsqueda o el filtro de estado.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UsuarioEmpresaModal
        open={modalOpen}
        mode={modalMode}
        userData={selectedUser}
        existingUsers={usuarios}
        onClose={closeModal}
        onSubmit={handleSubmitUser}
      />
    </section>
  );
};

export default UsuariosEmpresa;