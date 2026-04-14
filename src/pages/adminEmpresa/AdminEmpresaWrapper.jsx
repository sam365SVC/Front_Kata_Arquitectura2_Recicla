import React, { useEffect, useMemo, useState } from "react";
import {
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import { MdOutlineBusinessCenter } from "react-icons/md";

import styles from "./AdminEmpresaWrapper.module.scss";
import UsuariosEmpresa from "./components/UsuariosEmpresa";
import TiposDispositivoEmpresa from "./components/TiposDispositivoEmpresa";

const NAV_ITEMS = [
  {
    id: "usuariosEmpresa",
    label: "Usuarios de la empresa",
    icon: FiUsers,
    title: "Gestión de usuarios",
    description:
      "Administra empleados, accesos, roles y usuarios asociados a la empresa.",
  },
  {
    id: "tiposDispositivo",
    label: "Tipos de dispositivos",
    icon: FiSettings,
    title: "Administración de dispositivos",
    description:
      "Configura qué dispositivos se recepcionan y qué condiciones serán consideradas.",
  },
];

const renderContent = (tab, props) => {
  switch (tab) {
    case "usuariosEmpresa":
      return <UsuariosEmpresa {...props} />;

    case "tiposDispositivo":
      return <TiposDispositivoEmpresa {...props} />;

    default:
      return <UsuariosEmpresa {...props} />;
  }
};

const AdminEmpresaWrapper = ({
  empresaNombre = "Recicla Tech S.R.L.",
  adminNombre = "Carlos Mendoza",
  adminEmail = "admin@recicla.com",
  tenantId = "1",
}) => {
  const [activeTab, setActiveTab] = useState("usuariosEmpresa");
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
        >
          <FiMenu size={18} />
        </button>

        <div className={styles.mobileBar__info}>
          <h2>
            Admin <span>Empresa</span>
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
              <MdOutlineBusinessCenter size={22} />
            </div>

            <div className={styles.sidebar__brandText}>
              <h1>Admin Empresa</h1>
              <p>Panel administrativo</p>
            </div>
          </div>

          <button
            className={styles.sidebar__toggleBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expandir" : "Colapsar"}
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
            aria-label="Navegación del administrador de empresa"
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
                <span>{empresaNombre}</span>
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
              empresaNombre,
              adminNombre,
            })}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminEmpresaWrapper;