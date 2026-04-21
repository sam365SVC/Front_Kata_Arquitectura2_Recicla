import React, { useEffect, useMemo, useState } from "react";
import {
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUsers,
  FiSettings,
  FiDollarSign,
  FiBriefcase,
  FiCreditCard,
} from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

import styles from "./AdminServicioWrapper.module.scss";
import UsuariosServicio from "./components/UsuariosServicio";
import TiposDispositivoServicio from "./components/TiposDispositivoServicio";
import IngresosServicio from "./components/IngresosServicio";
import EmpresasServicio from "./components/EmpresasServicio";
import GastosServicio from "./components/GastosServicio";

const NAV_ITEMS = [
  {
    id: "usuariosServicio",
    label: "Usuarios del servicio",
    icon: FiUsers,
    title: "Gestión de usuarios del servicio",
    description:
      "Administra los usuarios globales del sistema, accesos y permisos asociados a la plataforma.",
  },
  {
    id: "tiposDispositivo",
    label: "Tipos de dispositivos",
    icon: FiSettings,
    title: "Administración de dispositivos",
    description:
      "Configura los tipos de dispositivos, reglas de valoración y checklist de inspección disponibles en el sistema.",
  },
  {
    id: "misIngresos",
    label: "Mis ingresos",
    icon: FiDollarSign,
    title: "Ingresos por suscripciones",
    description:
      "Consulta los pagos recibidos por planes y suscripciones de las empresas registradas en la plataforma.",
  },
  {
    id: "misEmpresas",
    label: "Mis empresas",
    icon: FiBriefcase,
    title: "Empresas registradas",
    description:
      "Visualiza y administra las empresas clientes que usan el servicio, su estado y su plan activo.",
  },
  {
    id: "misGastos",
    label: "Mis gastos",
    icon: FiCreditCard,
    title: "Gastos por operación",
    description:
      "Revisa los pagos realizados a clientes por dispositivos recepcionados y completados dentro del sistema.",
  },
];

const renderContent = (tab, props) => {
  switch (tab) {
    case "usuariosServicio":
      return <UsuariosServicio {...props} />;

    case "tiposDispositivo":
      return <TiposDispositivoServicio {...props} />;

    case "misIngresos":
      return <IngresosServicio {...props} />;

    case "misEmpresas":
      return <EmpresasServicio {...props} />;

    case "misGastos":
      return <GastosServicio {...props} />;

    default:
      return <UsuariosServicio {...props} />;
  }
};

const AdminServicioWrapper = ({
  servicioNombre = "Reecicla SaaS",
  adminNombre = "Administrador General",
  adminEmail = "admin@reecicla.com",
  tenantId = "1",
}) => {
  const [activeTab, setActiveTab] = useState("usuariosServicio");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0],
    [activeTab]
  );

  const iniciales = adminNombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) setMobileOpen(false);
      if (window.innerWidth <= 991) setCollapsed(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarClass = [
    styles.sidebar,
    collapsed ? styles["sidebar--collapsed"] : "",
    mobileOpen ? styles["sidebar--mobileOpen"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={styles.mobileBar}>
        <button
          className={styles.mobileBar__toggle}
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          type="button"
        >
          <FiMenu size={18} />
        </button>

        <div className={styles.mobileBar__info}>
          <h2>
            Admin <span>Servicio</span>
          </h2>
          <p>{activeItem.label}</p>
        </div>
      </div>

      <div
        className={`${styles.overlay} ${
          mobileOpen ? styles["overlay--active"] : ""
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={styles.shell}>
        <aside className={sidebarClass}>
          <div className={styles.sidebar__brand}>
            <div className={styles.sidebar__brandIcon}>
              <MdOutlineAdminPanelSettings size={22} />
            </div>

            <div className={styles.sidebar__brandText}>
              <h1>Admin Servicio</h1>
              <p>Panel SaaS</p>
            </div>
          </div>

          <button
            className={styles.sidebar__toggleBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expandir" : "Colapsar"}
            type="button"
          >
            {collapsed ? (
              <FiChevronRight size={13} />
            ) : (
              <FiChevronLeft size={13} />
            )}
          </button>

          <div className={styles.sidebar__infoPanel}>
            <p>{activeItem.title}</p>
            <span>{activeItem.description}</span>
          </div>

          <nav
            className={styles.sidebar__nav}
            aria-label="Navegación del administrador del servicio"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  className={[
                    styles.sidebar__navItem,
                    isActive ? styles["sidebar__navItem--active"] : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleNav(item.id)}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  type="button"
                >
                  <span className={styles.sidebar__navIcon}>
                    <Icon size={18} />
                  </span>
                  <span className={styles.sidebar__navLabel}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className={styles.sidebar__footer}>
            <div className={styles.sidebar__footerUser}>
              <div className={styles.sidebar__footerAvatar}>{iniciales}</div>

              <div className={styles.sidebar__footerInfo}>
                <p>{adminNombre}</p>
                <span>{servicioNombre}</span>
                <small>{adminEmail}</small>
              </div>

              <div className={styles.sidebar__footerAction}>
                <FiLogOut size={15} />
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.contentBody}>
            {renderContent(activeTab, {
              tenantId,
              servicioNombre,
              adminNombre,
              adminEmail,
            })}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminServicioWrapper;