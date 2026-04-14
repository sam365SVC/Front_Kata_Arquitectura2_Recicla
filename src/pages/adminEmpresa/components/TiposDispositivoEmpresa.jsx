import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiSearch,
  FiCpu,
  FiCheckCircle,
  FiSlash,
  FiEdit2,
  FiPower,
  FiList,
  FiClipboard,
  FiDollarSign,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";
import styles from "./TiposDispositivoEmpresa.module.scss";
import TipoDispositivoModal from "./TipoDispositivoModal";
import {
  fetchTiposDispositivoEmpresa,
  createTipoDispositivoEmpresa,
  updateTipoDispositivoEmpresa,
  changeEstadoTipoDispositivoEmpresa,
} from "../slicesTiposDispositivoEmpresa/TiposDispositivoEmpresaThunk";
import {
  selectTiposDispositivoEmpresa,
  selectTiposDispositivoEmpresaTotal,
  selectTiposDispositivoEmpresaLoading,
  selectTiposDispositivoEmpresaError,
  selectTiposDispositivoEmpresaSuccess,
  clearTiposDispositivoEmpresaError,
  clearTiposDispositivoEmpresaSuccess,
} from "../slicesTiposDispositivoEmpresa/TiposDispositivoEmpresaSlice";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `Bs. ${amount.toLocaleString("es-BO")}`;
};

const buildSwalClasses = () => ({
  popup: styles.swalPopup,
  title: styles.swalTitle,
  htmlContainer: styles.swalText,
  confirmButton: styles.swalConfirm,
  cancelButton: styles.swalCancel,
});

const TiposDispositivoEmpresa = ({ tenantId = 1 }) => {
  const dispatch = useDispatch();

  const tipos = useSelector(selectTiposDispositivoEmpresa);
  const total = useSelector(selectTiposDispositivoEmpresaTotal);
  const loading = useSelector(selectTiposDispositivoEmpresaLoading);
  const error = useSelector(selectTiposDispositivoEmpresaError);
  const successMessage = useSelector(selectTiposDispositivoEmpresaSuccess);

  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTipo, setSelectedTipo] = useState(null);

  useEffect(() => {
    dispatch(fetchTiposDispositivoEmpresa({ tenantId }));
  }, [dispatch, tenantId]);

  useEffect(() => {
    if (!error) return;

    Swal.fire({
      icon: "error",
      title: "No se pudo completar la operación",
      text: error,
      confirmButtonText: "Entendido",
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });

    dispatch(clearTiposDispositivoEmpresaError());
  }, [error, dispatch]);

  useEffect(() => {
    if (!successMessage) return;

    Swal.fire({
      icon: "success",
      title: "Operación realizada",
      text: successMessage,
      confirmButtonText: "Perfecto",
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });

    dispatch(clearTiposDispositivoEmpresaSuccess());
  }, [successMessage, dispatch]);

  const tiposFiltrados = useMemo(() => {
    const query = normalizeText(search);

    return (tipos || []).filter((item) => {
      const matchesSearch =
        !query ||
        normalizeText(item.codigo).includes(query) ||
        normalizeText(item.nombre).includes(query) ||
        normalizeText(item.precioBase).includes(query);

      const matchesEstado =
        estadoFiltro === "Todos" ||
        (estadoFiltro === "Activos" && item.activo === true) ||
        (estadoFiltro === "Inactivos" && item.activo === false);

      return matchesSearch && matchesEstado;
    });
  }, [tipos, search, estadoFiltro]);

  const resumen = useMemo(() => {
    const activos = (tipos || []).filter((item) => item.activo).length;
    const inactivos = (tipos || []).filter((item) => !item.activo).length;

    const reglas = (tipos || []).reduce(
      (acc, item) =>
        acc +
        (Array.isArray(item.reglasCotizacion)
          ? item.reglasCotizacion.length
          : 0),
      0
    );

    const checklist = (tipos || []).reduce(
      (acc, item) =>
        acc +
        (Array.isArray(item.checklistInspeccion)
          ? item.checklistInspeccion.length
          : 0),
      0
    );

    return {
      total: total || (tipos || []).length,
      activos,
      inactivos,
      reglas,
      checklist,
    };
  }, [tipos, total]);

  const handleRefresh = () => {
    dispatch(fetchTiposDispositivoEmpresa({ tenantId }));
  };

  const openCreateModal = () => {
    setSelectedTipo(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (tipo) => {
    setSelectedTipo(tipo);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTipo(null);
  };

  const handleSubmitTipo = async (payload, { isEditMode, originalItem }) => {
    if (isEditMode && originalItem?._id) {
      await dispatch(
        updateTipoDispositivoEmpresa({
          id: originalItem._id,
          data: payload,
        })
      );
    } else {
      await dispatch(createTipoDispositivoEmpresa(payload));
    }

    closeModal();
  };

  const handleToggleEstado = async (tipo) => {
    const activar = !tipo.activo;

    const result = await Swal.fire({
      icon: "warning",
      title: activar ? "¿Activar dispositivo?" : "¿Desactivar dispositivo?",
      html: `
        <div>
          Vas a ${activar ? "<b>activar</b>" : "<b>desactivar</b>"} el tipo
          <b>${tipo.nombre}</b> (${tipo.codigo}).
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: activar ? "Sí, activar" : "Sí, desactivar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });

    if (!result.isConfirmed) return;

    dispatch(
      changeEstadoTipoDispositivoEmpresa({
        id: tipo._id,
        activo: activar,
      })
    );
  };

  const handleViewDetails = async (tipo) => {
    const reglasHtml =
      Array.isArray(tipo.reglasCotizacion) && tipo.reglasCotizacion.length
        ? `
        <div class="${styles.detailSection}">
          <h4>Reglas de cotización</h4>
          <div class="${styles.detailList}">
            ${tipo.reglasCotizacion
              .map(
                (regla) => `
                  <div class="${styles.detailItem}">
                    <strong>${regla.codigo}</strong>
                    <span>${regla.descripcion || "Sin descripción"}</span>
                    <small>
                      Campo: ${regla.campo} | Operador: ${regla.operador} | Valor: ${regla.valor} | Ajuste: ${formatMoney(regla.ajusteMonto)}
                    </small>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `
        : `
        <div class="${styles.detailSection}">
          <h4>Reglas de cotización</h4>
          <p>No tiene reglas registradas.</p>
        </div>
      `;

    const checklistHtml =
      Array.isArray(tipo.checklistInspeccion) && tipo.checklistInspeccion.length
        ? `
        <div class="${styles.detailSection}">
          <h4>Checklist de inspección</h4>
          <div class="${styles.detailList}">
            ${tipo.checklistInspeccion
              .map(
                (item) => `
                  <div class="${styles.detailItem}">
                    <strong>${item.codigo}</strong>
                    <span>${item.descripcion}</span>
                    <small>${item.obligatorio ? "Obligatorio" : "Opcional"}</small>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `
        : `
        <div class="${styles.detailSection}">
          <h4>Checklist de inspección</h4>
          <p>No tiene checklist registrado.</p>
        </div>
      `;

    await Swal.fire({
      title: tipo.nombre,
      html: `
        <div class="${styles.detailWrapper}">
          <div class="${styles.detailTopGrid}">
            <div class="${styles.detailMetric}">
              <span>Código</span>
              <strong>${tipo.codigo}</strong>
            </div>
            <div class="${styles.detailMetric}">
              <span>Estado</span>
              <strong>${tipo.activo ? "Activo" : "Inactivo"}</strong>
            </div>
            <div class="${styles.detailMetric}">
              <span>Precio base</span>
              <strong>${formatMoney(tipo.precioBase)}</strong>
            </div>
            <div class="${styles.detailMetric}">
              <span>Tenant</span>
              <strong>${tipo.tenantId}</strong>
            </div>
          </div>

          ${reglasHtml}
          ${checklistHtml}
        </div>
      `,
      width: 960,
      confirmButtonText: "Cerrar",
      buttonsStyling: false,
      customClass: buildSwalClasses(),
    });
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.hero}>
        <div>
          <span className={styles.hero__eyebrow}>Configuración operativa</span>
          <h2>Tipos de dispositivos</h2>
          <p>
            Gestiona los dispositivos que la empresa puede recepcionar, su
            precio base, reglas de cotización y checklist de inspección.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw size={16} />
            Actualizar
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreateModal}
          >
            <FiPlus size={16} />
            Nuevo tipo
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiCpu size={18} />
          </div>
          <div>
            <strong>{resumen.total}</strong>
            <span>Total de tipos</span>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiCheckCircle size={18} />
          </div>
          <div>
            <strong>{resumen.activos}</strong>
            <span>Tipos activos</span>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiSlash size={18} />
          </div>
          <div>
            <strong>{resumen.inactivos}</strong>
            <span>Tipos inactivos</span>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiList size={18} />
          </div>
          <div>
            <strong>{resumen.reglas}</strong>
            <span>Reglas registradas</span>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCard__icon}>
            <FiClipboard size={18} />
          </div>
          <div>
            <strong>{resumen.checklist}</strong>
            <span>Items de checklist</span>
          </div>
        </article>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Buscar por código, nombre o precio base..."
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
          <option value="Activos">Activos</option>
          <option value="Inactivos">Inactivos</option>
        </select>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Listado de tipos de dispositivo</h3>
            <span>
              Mostrando {tiposFiltrados.length} de {resumen.total} registros
            </span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>Código</th>
                <th>Precio base</th>
                <th>Reglas</th>
                <th>Checklist</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className={styles.emptyTable}>
                      <h4>Cargando tipos de dispositivo...</h4>
                      <p>
                        Espera un momento mientras obtenemos la información.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : tiposFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className={styles.emptyTable}>
                      <h4>No se encontraron tipos de dispositivo</h4>
                      <p>
                        Prueba cambiando la búsqueda o el filtro de estado.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tiposFiltrados.map((tipo) => (
                  <tr key={tipo._id}>
                    <td>
                      <div className={styles.deviceCell}>
                        <div className={styles.deviceAvatar}>
                          <FiCpu size={18} />
                        </div>

                        <div className={styles.deviceMeta}>
                          <strong>{tipo.nombre}</strong>
                          <span>ID: {tipo._id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={styles.codeBadge}>{tipo.codigo}</span>
                    </td>

                    <td>
                      <div className={styles.priceCell}>
                        <span>{formatMoney(tipo.precioBase)}</span>
                      </div>
                    </td>

                    <td>
                      <span className={styles.countBadge}>
                        {Array.isArray(tipo.reglasCotizacion)
                          ? tipo.reglasCotizacion.length
                          : 0}
                      </span>
                    </td>

                    <td>
                      <span className={styles.countBadge}>
                        {Array.isArray(tipo.checklistInspeccion)
                          ? tipo.checklistInspeccion.length
                          : 0}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`${styles.badge} ${
                          tipo.activo
                            ? styles.badgeActive
                            : styles.badgeInactive
                        }`}
                      >
                        {tipo.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => handleViewDetails(tipo)}
                        >
                          <FiEye size={14} />
                          Detalle
                        </button>

                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => openEditModal(tipo)}
                        >
                          <FiEdit2 size={14} />
                          Editar
                        </button>

                        <button
                          type="button"
                          className={`${styles.actionButton} ${
                            tipo.activo
                              ? styles.actionDanger
                              : styles.actionSuccess
                          }`}
                          onClick={() => handleToggleEstado(tipo)}
                        >
                          <FiPower size={14} />
                          {tipo.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TipoDispositivoModal
        open={modalOpen}
        mode={modalMode}
        tenantId={tenantId}
        initialData={selectedTipo}
        onClose={closeModal}
        onSubmit={handleSubmitTipo}
      />
    </section>
  );
};

export default TiposDispositivoEmpresa;