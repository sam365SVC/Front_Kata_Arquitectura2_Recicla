import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiEye,
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiLayers,
  FiMail,
  FiPhone,
  FiGlobe,
  FiCheckCircle,
  FiClipboard,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import styles from "./EmpresasServicio.module.scss";
import { fetchAllTenants } from "../slicesEmpresas/EmpresaThunk";
import {
  selectTenants,
  selectTenantsLoading,
  selectTenantsError,
  selectTenantsTotal,
  selectTenantsPagina,
  selectTenantsTotalPaginas,
} from "../slicesEmpresas/TenantsSelectors";

const fmtFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const EstadoBadge = ({ estado }) => {
  const estadoNormalizado = String(estado || "").toLowerCase();

  const map = {
    activo: "success",
    activa: "success",
    suspendido: "danger",
    suspendida: "danger",
    prueba: "warning",
    trial: "warning",
  };

  const label = {
    activo: "Activo",
    activa: "Activa",
    suspendido: "Suspendido",
    suspendida: "Suspendida",
    prueba: "Prueba",
    trial: "Prueba",
  };

  return (
    <span
      className={`${styles.estadoBadge} ${
        styles[`estadoBadge--${map[estadoNormalizado] || "default"}`]
      }`}
    >
      {label[estadoNormalizado] || estado || "—"}
    </span>
  );
};

const PlanBadge = ({ plan }) => {
  const planNormalizado = String(plan || "").toLowerCase();

  const map = {
    free: "free",
    basic: "basic",
    premium: "premium",
  };

  return (
    <span
      className={`${styles.planBadge} ${
        styles[`planBadge--${map[planNormalizado] || "default"}`]
      }`}
    >
      {plan || "—"}
    </span>
  );
};

const EmpresasServicio = () => {
  const dispatch = useDispatch();

  const empresas = useSelector(selectTenants);
  const loading = useSelector(selectTenantsLoading);
  const error = useSelector(selectTenantsError);
  const total = useSelector(selectTenantsTotal);
  const pagina = useSelector(selectTenantsPagina);
  const totalPaginas = useSelector(selectTenantsTotalPaginas);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPlan, setFiltroPlan] = useState("");
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    dispatch(fetchAllTenants({ page: 1, limit: 5 }));
  }, [dispatch]);

  const cambiarPagina = (nuevaPagina) => {
    dispatch(fetchAllTenants({ page: nuevaPagina, limit: 5 }));
  };

  console.log("empresas selector:", empresas);
console.log("loading selector:", loading);
console.log("error selector:", error);
console.log("total selector:", total);

  const empresasFiltradas = useMemo(() => {
    let lista = [...empresas];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (e) =>
          String(e.id).toLowerCase().includes(q) ||
          String(e.nombre).toLowerCase().includes(q) ||
          String(e.emailContacto).toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      lista = lista.filter(
        (e) => String(e.estado).toLowerCase() === filtroEstado.toLowerCase()
      );
    }

    if (filtroPlan) {
      lista = lista.filter(
        (e) => String(e.plan).toLowerCase() === filtroPlan.toLowerCase()
      );
    }

    return lista;
  }, [empresas, busqueda, filtroEstado, filtroPlan]);

  const resumen = useMemo(() => {
    const activas = empresas.filter((e) =>
      ["activo", "activa"].includes(String(e.estado).toLowerCase())
    ).length;

    const suspendidas = empresas.filter((e) =>
      ["suspendido", "suspendida"].includes(String(e.estado).toLowerCase())
    ).length;

    const prueba = empresas.filter((e) =>
      ["prueba", "trial"].includes(String(e.estado).toLowerCase())
    ).length;

    return {
      total,
      activas,
      suspendidas,
      prueba,
      totalUsuarios: 0, // aquí luego lo conectas si tu backend devuelve cantidad de usuarios
    };
  }, [empresas, total]);

  const hayFiltros = busqueda || filtroEstado || filtroPlan;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("");
    setFiltroPlan("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Mis Empresas</h1>
          <p>
            Empresas registradas en la plataforma y su estado actual dentro del
            servicio.
          </p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
          <div className={styles.statCard__icon}>
            <FiBriefcase size={18} />
          </div>
          <div className={styles.statCard__value}>{resumen.total}</div>
          <div className={styles.statCard__label}>Empresas registradas</div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--active"]}`}>
          <div className={styles.statCard__icon}>
            <FiCheckCircle size={18} />
          </div>
          <div className={styles.statCard__value}>{resumen.activas}</div>
          <div className={styles.statCard__label}>Activas</div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--trial"]}`}>
          <div className={styles.statCard__icon}>
            <FiLayers size={18} />
          </div>
          <div className={styles.statCard__value}>{resumen.prueba}</div>
          <div className={styles.statCard__label}>En prueba</div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--users"]}`}>
          <div className={styles.statCard__icon}>
            <FiUsers size={18} />
          </div>
          <div className={styles.statCard__value}>{resumen.totalUsuarios}</div>
          <div className={styles.statCard__label}>Usuarios registrados</div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FiSearch size={15} className={styles.searchWrap__icon} />
          <input
            type="text"
            placeholder="Buscar por ID, empresa o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className={styles.filterSelect}>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="prueba">Prueba</option>
          </select>
        </div>

        <div className={styles.filterSelect}>
          <select
            value={filtroPlan}
            onChange={(e) => setFiltroPlan(e.target.value)}
          >
            <option value="">Todos los planes</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {hayFiltros && (
          <button className={styles.clearBtn} onClick={limpiarFiltros} type="button">
            <FiX size={13} /> Limpiar
          </button>
        )}
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>
            <FiFilter size={26} />
            <h3>Cargando empresas...</h3>
            <p>Espera un momento mientras se obtiene la información.</p>
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <FiX size={26} />
            <h3>Error al cargar</h3>
            <p>{error}</p>
          </div>
        ) : empresasFiltradas.length === 0 ? (
          <div className={styles.empty}>
            <FiFilter size={26} />
            <h3>Sin resultados</h3>
            <p>No se encontraron empresas con los filtros aplicados.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Fecha registro</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {empresasFiltradas.map((empresa) => (
                <tr key={empresa.id}>
                  <td>
                    <span className={styles.idCell}>{empresa.id}</span>
                  </td>
                  <td className={styles.companyCell}>{empresa.nombre}</td>
                  <td>
                    <PlanBadge plan={empresa.plan} />
                  </td>
                  <td>
                    <EstadoBadge estado={empresa.estado} />
                  </td>
                  <td>{empresa.emailContacto || "—"}</td>
                  <td>{empresa.telefono || "—"}</td>
                  <td>{fmtFecha(empresa.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnView}
                      onClick={() => setDetalle(empresa)}
                    >
                      <FiEye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && totalPaginas > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            onClick={() => cambiarPagina(pagina - 1)}
            disabled={pagina <= 1}
          >
            <FiChevronLeft size={14} />
            Anterior
          </button>

          <span>
            Página {pagina} de {totalPaginas}
          </span>

          <button
            type="button"
            onClick={() => cambiarPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
          >
            Siguiente
            <FiChevronRight size={14} />
          </button>
        </div>
      )}

      {detalle && (
        <div className={styles.drawerOverlay} onClick={() => setDetalle(null)}>
          <aside
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            aria-label="Detalle de empresa"
          >
            <div className={styles.drawer__header}>
              <div>
                <p className={styles.drawer__eyebrow}>Detalle de empresa</p>
                <h3>{detalle.nombre}</h3>
              </div>

              <button
                type="button"
                className={styles.drawer__close}
                onClick={() => setDetalle(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.drawer__body}>
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiBriefcase size={14} /> ID empresa</span>
                  <strong>{detalle.id}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiLayers size={14} /> Plan</span>
                  <strong><PlanBadge plan={detalle.plan} /></strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiCheckCircle size={14} /> Estado</span>
                  <strong><EstadoBadge estado={detalle.estado} /></strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiCalendar size={14} /> Registro</span>
                  <strong>{fmtFecha(detalle.createdAt)}</strong>
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiMail size={14} /> Email</span>
                  <strong>{detalle.emailContacto || "—"}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiPhone size={14} /> Teléfono</span>
                  <strong>{detalle.telefono || "—"}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Tenant ID</span>
                  <strong>{detalle.id}</strong>
                </div>
              </div>

              <div className={styles.detailNote}>
                <p>Observación</p>
                <span>Sin observaciones registradas.</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default EmpresasServicio;