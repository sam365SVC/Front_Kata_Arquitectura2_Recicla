import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiPower,
  FiMail,
  FiUsers,
  FiShield,
} from "react-icons/fi";

import styles from "./UsuariosEmpresa.module.scss";
import UsuarioEmpresaModal from "./UsuarioEmpresaModal";

import {
  fetchUsuariosEmpresa,
  createUsuarioEmpresa,
  editUsuarioEmpresa,
  changeEstadoUsuarioEmpresa,
} from "../slicesUsuariosEmpresa/UsuariosEmpresaThunk";
import { clearUsuariosEmpresaError } from "../slicesUsuariosEmpresa/UsuariosEmpresaSlice";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const buildSwalClasses = () => ({
  popup: styles.swalPopup,
  title: styles.swalTitle,
  htmlContainer: styles.swalText,
  confirmButton: styles.swalConfirm,
  cancelButton: styles.swalCancel,
});

const UsuariosEmpresa = () => {
  const dispatch = useDispatch();

  const usuarios = useSelector((state) => state.usuariosEmpresa.items);
  const loading = useSelector((state) => state.usuariosEmpresa.loading);
  const error = useSelector((state) => state.usuariosEmpresa.error);

  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsuariosEmpresa());
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;

    Swal.fire({
      icon: "error",
      title: "Ocurrió un problema",
      text: error,
      confirmButtonText: "Entendido",
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    }).then(() => {
      dispatch(clearUsuariosEmpresaError());
    });
  }, [error, dispatch]);

  const usuariosFiltrados = useMemo(() => {
    const query = normalizeText(search);

    return usuarios.filter((usuario) => {
      const matchesSearch =
        !query ||
        normalizeText(usuario.nombre).includes(query) ||
        normalizeText(usuario.email).includes(query) ||
        normalizeText(usuario.rol).includes(query);

      const matchesEstado =
        estadoFiltro === "Todos" || usuario.estado === estadoFiltro;

      return matchesSearch && matchesEstado;
    });
  }, [usuarios, search, estadoFiltro]);

  const resumen = useMemo(() => {
    const activos = usuarios.filter((u) => u.estado === "Activo").length;
    const inactivos = usuarios.filter((u) => u.estado === "Inactivo").length;

    const admins = usuarios.filter((u) =>
      normalizeText(u.rol).includes("admin")
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

  const handleSubmitUser = async (payload, { isEditMode }) => {
    if (isEditMode) {
      const result = await dispatch(editUsuarioEmpresa(payload));

      if (!result?.ok) return;

      closeModal();

      await showSuccessAlert({
        title: "Usuario actualizado",
        text: `Los datos de ${payload?.nombre || "este usuario"} se guardaron correctamente.`,
        confirmText: "Perfecto",
      });

      return;
    }

    const result = await dispatch(createUsuarioEmpresa(payload));

    if (!result?.ok) return;

    closeModal();

    await showSuccessAlert({
      title: "Invitación enviada",
      text: `Se envió correctamente la invitación a ${payload.email}.`,
      confirmText: "Continuar",
    });
  };

  const toggleEstadoUsuario = async (usuario) => {
    if (usuario.estado !== "Activo") {
      await Swal.fire({
        icon: "info",
        title: "Usuario inactivo",
        text: "Por ahora solo está disponible la desactivación desde este panel.",
        confirmButtonText: "Entendido",
        buttonsStyling: false,
        customClass: buildSwalClasses(),
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "¿Desactivar usuario?",
      html: `
        <div>
          Se desactivará a <b>${usuario.nombre}</b>.<br/>
          El usuario dejará de estar activo en este tenant.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });

    if (!result.isConfirmed) return;

    const action = await dispatch(changeEstadoUsuarioEmpresa(usuario.id));

    if (!action?.ok) return;

    await showSuccessAlert({
      title: "Usuario desactivado",
      text: `${usuario.nombre} ahora se encuentra inactivo.`,
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
            Administra empleados, roles y estados dentro del panel de la empresa.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={openCreateModal}
        >
          <FiPlus size={16} />
          Invitar usuario
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
            placeholder="Buscar por nombre, correo o rol..."
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
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
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

                const fechaCreacion = usuario.createdAt
                  ? new Date(usuario.createdAt).toLocaleDateString()
                  : "Sin fecha";

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
                      </div>
                    </td>

                    <td>
                      <span className={styles.roleBadge}>
                        {usuario.rol || "Sin rol"}
                      </span>
                    </td>

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

                    <td>{fechaCreacion}</td>

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
                              : styles.actionDisabled
                          }`}
                          onClick={() => toggleEstadoUsuario(usuario)}
                          disabled={usuario.estado !== "Activo"}
                        >
                          <FiPower size={14} />
                          {usuario.estado === "Activo"
                            ? "Desactivar"
                            : "Inactivo"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className={styles.emptyTable}>
                      <h4>No se encontraron usuarios</h4>
                      <p>
                        Prueba cambiando la búsqueda o el filtro de estado.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan="6">
                    <div className={styles.emptyTable}>
                      <h4>Cargando usuarios...</h4>
                      <p>Espera un momento mientras obtenemos la información.</p>
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