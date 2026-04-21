import React, { useState, useEffect, useMemo } from "react";
import {
  FiSend,
  FiMap,
  FiList,
  FiGrid,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { useSocket } from "../../socket/SocketContext";

import Dashboard from "../admin/components/Dashboard/Dashboard";
import MapaOperacional from "../admin/components/MapaOperacional/MapaOperacional";
import PanelOrdenes from "./components/PanelOrdenesLogistica/PanelOrdenesLogistica";
import PanelDespacho from "./components/PanelDespacho/PanelDespacho";

import styles from "./DespachadorWrapper.module.scss";

import { logout } from "../signin/slices/loginSlice";
import { selectUser } from "../signin/slices/loginSelectors";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FiGrid,
    title: "Dashboard general",
    description: "Métricas y estado del sistema en tiempo real.",
  },
  {
    id: "mapa",
    label: "Mapa operacional",
    icon: FiMap,
    title: "Mapa en tiempo real",
    description: "Vehículos, kioscos y órdenes activas en el mapa.",
  },
  {
    id: "ordenes",
    label: "Órdenes",
    icon: FiList,
    title: "Gestión de órdenes",
    description: "Filtra órdenes y confirma recepciones en almacén.",
  },
  {
    id: "despacho",
    label: "Panel de despacho",
    icon: FiSend,
    title: "Panel de despacho",
    description: "Asigna conductores y calcula rutas óptimas.",
  },
];

const renderContent = (tab) => {
  switch (tab) {
    case "dashboard":
      return <Dashboard />;
    case "mapa":
      return <MapaOperacional />;
    case "ordenes":
      return <PanelOrdenes />;
    case "despacho":
      return <PanelDespacho />;
    default:
      return <Dashboard />;
  }
};

const getInitials = (name = "") => {
  if (!name.trim()) return "DP";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getDisplayNameFromEmail = (email = "") => {
  if (!email || !email.includes("@")) return "Despachador";

  const localPart = email.split("@")[0];

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const DespachadorWrapper = ({
  nombreUsuario: nombreUsuarioProp,
  emailUsuario: emailUsuarioProp,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const { connected, solicitarPosiciones } = useSocket();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const emailUsuario =
    emailUsuarioProp || user?.mail || user?.email || "logistica@logistics.com";

  const nombreUsuario =
    nombreUsuarioProp ||
    user?.nombres ||
    [user?.nombre, user?.apellido].filter(Boolean).join(" ") ||
    getDisplayNameFromEmail(emailUsuario);

  useEffect(() => {
    if (connected && typeof solicitarPosiciones === "function") {
      solicitarPosiciones();
    }
  }, [connected, solicitarPosiciones]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) setMobileOpen(false);
      if (window.innerWidth <= 991) setCollapsed(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0],
    [activeTab]
  );

  const iniciales = useMemo(
    () => getInitials(nombreUsuario),
    [nombreUsuario]
  );

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tendrás que volver a iniciar sesión para acceder al panel de despacho.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e27d32",
      cancelButtonColor: "#b8b8b8",
      background: "#fffef8",
      color: "#2f2f2f",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    dispatch(logout());

    await Swal.fire({
      title: "Sesión cerrada",
      text: "Has salido correctamente.",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
      background: "#fffef8",
      color: "#2f2f2f",
    });

    navigate("/signin", { replace: true });
  };

  const sidebarCls = [
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
            Logística <span>Operaciones</span>
          </h2>
          <p>{activeItem.label}</p>
        </div>

        <div
          className={`${styles.mobileBar__ws} ${
            connected ? styles["mobileBar__ws--on"] : ""
          }`}
          title={connected ? "Conectado" : "Desconectado"}
        />
      </div>

      <div
        className={`${styles.overlay} ${
          mobileOpen ? styles["overlay--active"] : ""
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={styles.shell}>
        <aside className={sidebarCls}>
          <div className={styles.sidebar__brand}>
            <div className={styles.sidebar__brandIcon}>
              <MdOutlineLocalShipping size={22} />
            </div>

            <div className={styles.sidebar__brandText}>
              <h1>Logística</h1>
              <p>Operaciones</p>
            </div>
          </div>

          <button
            className={styles.sidebar__toggleBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={
              collapsed ? "Expandir menú lateral" : "Colapsar menú lateral"
            }
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

          <div className={styles.sidebar__wsStatus}>
            <span
              className={`${styles.sidebar__wsDot} ${
                connected ? styles["sidebar__wsDot--on"] : ""
              }`}
            />
            <span className={styles.sidebar__wsLabel}>
              {connected ? "Tiempo real activo" : "Sin conexión en tiempo real"}
            </span>
          </div>

          <nav
            className={styles.sidebar__nav}
            aria-label="Navegación del despachador"
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
                <p>{nombreUsuario}</p>
                <span>{emailUsuario}</span>
              </div>

              <button
                type="button"
                className={styles.sidebar__footerAction}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                onClick={handleLogout}
              >
                <FiLogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.contentBody}>{renderContent(activeTab)}</div>
        </main>
      </div>
    </>
  );
};

export default DespachadorWrapper;