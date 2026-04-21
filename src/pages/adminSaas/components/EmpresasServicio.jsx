import React, { useMemo, useState } from "react";
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
  FiClipboard
} from "react-icons/fi";
import styles from "./EmpresasServicio.module.scss";

const MOCK_EMPRESAS = [
  {
    _id: "EMP-001",
    nombre: "EcoTech S.R.L.",
    tenantId: 1,
    plan: "Basic",
    estado: "activa",
    usuarios: 8,
    dispositivos: 14,
    fechaRegistro: "2026-04-01T10:00:00.000Z",
    email: "contacto@ecotech.com",
    telefono: "+591 70112233",
    ciudad: "La Paz",
    responsable: "Carla Mendoza",
    observacion: "Empresa estable con renovación mensual activa.",
  },
  {
    _id: "EMP-002",
    nombre: "Green Systems",
    tenantId: 2,
    plan: "Premium",
    estado: "activa",
    usuarios: 15,
    dispositivos: 22,
    fechaRegistro: "2026-04-03T15:20:00.000Z",
    email: "admin@greensystems.com",
    telefono: "+591 71555666",
    ciudad: "Santa Cruz",
    responsable: "Luis Fernández",
    observacion: "Cliente con alto volumen operativo y uso continuo del servicio.",
  },
  {
    _id: "EMP-003",
    nombre: "Nova Circular",
    tenantId: 3,
    plan: "Free",
    estado: "prueba",
    usuarios: 2,
    dispositivos: 4,
    fechaRegistro: "2026-04-08T08:40:00.000Z",
    email: "hello@novacircular.com",
    telefono: "+591 73444555",
    ciudad: "Cochabamba",
    responsable: "Ana Rojas",
    observacion: "Empresa en evaluación inicial del servicio.",
  },
  {
    _id: "EMP-004",
    nombre: "ReUse Bolivia",
    tenantId: 4,
    plan: "Basic",
    estado: "suspendida",
    usuarios: 5,
    dispositivos: 9,
    fechaRegistro: "2026-04-10T11:30:00.000Z",
    email: "reuse@bolivia.com",
    telefono: "+591 77778888",
    ciudad: "Oruro",
    responsable: "Miguel Torres",
    observacion: "Suspendida por retraso en el pago del plan.",
  },
  {
    _id: "EMP-005",
    nombre: "Circular Hub",
    tenantId: 5,
    plan: "Premium",
    estado: "activa",
    usuarios: 11,
    dispositivos: 18,
    fechaRegistro: "2026-04-12T14:10:00.000Z",
    email: "soporte@circularhub.com",
    telefono: "+591 79990011",
    ciudad: "Sucre",
    responsable: "María López",
    observacion: "Empresa premium con buen crecimiento de uso.",
  },
];

const fmtFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const EstadoBadge = ({ estado }) => {
  const map = {
    activa: "success",
    suspendida: "danger",
    prueba: "warning",
  };

  const label = {
    activa: "Activa",
    suspendida: "Suspendida",
    prueba: "Prueba",
  };

  return (
    <span className={`${styles.estadoBadge} ${styles[`estadoBadge--${map[estado] || "default"}`]}`}>
      {label[estado] || estado}
    </span>
  );
};

const PlanBadge = ({ plan }) => {
  const map = {
    Free: "free",
    Basic: "basic",
    Premium: "premium",
  };

  return (
    <span className={`${styles.planBadge} ${styles[`planBadge--${map[plan] || "default"}`]}`}>
      {plan}
    </span>
  );
};

const EmpresasServicio = () => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPlan, setFiltroPlan] = useState("");
  const [detalle, setDetalle] = useState(null);

  const empresasFiltradas = useMemo(() => {
    let lista = [...MOCK_EMPRESAS];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (e) =>
          e._id.toLowerCase().includes(q) ||
          e.nombre.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.responsable.toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      lista = lista.filter((e) => e.estado === filtroEstado);
    }

    if (filtroPlan) {
      lista = lista.filter((e) => e.plan === filtroPlan);
    }

    return lista;
  }, [busqueda, filtroEstado, filtroPlan]);

  const resumen = useMemo(() => {
    const total = MOCK_EMPRESAS.length;
    const activas = MOCK_EMPRESAS.filter((e) => e.estado === "activa").length;
    const suspendidas = MOCK_EMPRESAS.filter((e) => e.estado === "suspendida").length;
    const prueba = MOCK_EMPRESAS.filter((e) => e.estado === "prueba").length;
    const totalUsuarios = MOCK_EMPRESAS.reduce((acc, e) => acc + Number(e.usuarios || 0), 0);

    return {
      total,
      activas,
      suspendidas,
      prueba,
      totalUsuarios,
    };
  }, []);

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
          <p>Empresas registradas en la plataforma y su estado actual dentro del servicio.</p>
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
            placeholder="Buscar por ID, empresa, email o responsable..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className={styles.filterSelect}>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="suspendida">Suspendida</option>
            <option value="prueba">Prueba</option>
          </select>
        </div>

        <div className={styles.filterSelect}>
          <select value={filtroPlan} onChange={(e) => setFiltroPlan(e.target.value)}>
            <option value="">Todos los planes</option>
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        {hayFiltros && (
          <button className={styles.clearBtn} onClick={limpiarFiltros} type="button">
            <FiX size={13} /> Limpiar
          </button>
        )}
      </div>

      <div className={styles.tableWrap}>
        {empresasFiltradas.length === 0 ? (
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
                <th>Usuarios</th>
                <th>Dispositivos</th>
                <th>Fecha registro</th>
                <th>Responsable</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {empresasFiltradas.map((empresa) => (
                <tr key={empresa._id}>
                  <td>
                    <span className={styles.idCell}>{empresa._id}</span>
                  </td>
                  <td className={styles.companyCell}>{empresa.nombre}</td>
                  <td>
                    <PlanBadge plan={empresa.plan} />
                  </td>
                  <td>
                    <EstadoBadge estado={empresa.estado} />
                  </td>
                  <td>{empresa.usuarios}</td>
                  <td>{empresa.dispositivos}</td>
                  <td>{fmtFecha(empresa.fechaRegistro)}</td>
                  <td>{empresa.responsable}</td>
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
                  <strong>{detalle._id}</strong>
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
                  <strong>{fmtFecha(detalle.fechaRegistro)}</strong>
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiUsers size={14} /> Usuarios</span>
                  <strong>{detalle.usuarios}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiBriefcase size={14} /> Dispositivos</span>
                  <strong>{detalle.dispositivos}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiUserIcon /> Responsable</span>
                  <strong>{detalle.responsable}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiGlobe size={14} /> Ciudad</span>
                  <strong>{detalle.ciudad}</strong>
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span><FiMail size={14} /> Email</span>
                  <strong>{detalle.email}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiPhone size={14} /> Teléfono</span>
                  <strong>{detalle.telefono}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span><FiClipboard size={14} /> Tenant ID</span>
                  <strong>{detalle.tenantId}</strong>
                </div>
              </div>

              <div className={styles.detailNote}>
                <p>Observación</p>
                <span>{detalle.observacion || "Sin observaciones."}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

const FiUserIcon = () => <span style={{ fontSize: 14 }}>👤</span>;

export default EmpresasServicio;