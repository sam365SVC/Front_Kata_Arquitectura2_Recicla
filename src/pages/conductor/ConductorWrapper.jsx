import React, { useState, useMemo } from "react";
import { FiMap, FiList, FiMenu, FiLogOut, FiX } from "react-icons/fi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { useSocket } from "../../socket/SocketContext";

import MiRuta from "./components/MiRuta/MiRuta";
import MisOrdenes from "./components/MisOrdenes/MisOrdenes";

import styles from "./ConductorWrapper.module.scss";

import { logout } from "../signin/slices/loginSlice";
import { selectUser } from "../signin/slices/loginSelectors";

const NAV_ITEMS = [
  {
    id: "ruta",
    label: "Mi ruta",
    icon: FiMap,
    title: "Mi ruta activa",
    description: "Tu ruta actual con waypoints y seguimiento en tiempo real.",
  },
  {
    id: "ordenes",
    label: "Mis órdenes",
    icon: FiList,
    title: "Órdenes asignadas",
    description: "Consulta tus órdenes y revisa su estado actual.",
  },
];

const renderContent = (tab) => {
  switch (tab) {
    case "ruta":
      return <MiRuta />;
    case "ordenes":
      return <MisOrdenes />;
    default:
      return <MiRuta />;
  }
};

const getInitials = (name = "") => {
  if (!name.trim()) return "CD";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getDisplayNameFromEmail = (email = "") => {
  if (!email || !email.includes("@")) return "Conductor";

  const localPart = email.split("@")[0];

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const ConductorWrapper = ({
  nombreUsuario: nombreUsuarioProp,
  emailUsuario: emailUsuarioProp,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const { connected } = useSocket();

  const [activeTab, setActiveTab] = useState("ruta");
  const [mobileOpen, setMobileOpen] = useState(false);

  const emailUsuario =
    emailUsuarioProp || user?.mail || user?.email || "conductor@logistics.com";

  const nombreUsuario =
    nombreUsuarioProp ||
    user?.nombres ||
    [user?.nombre, user?.apellido].filter(Boolean).join(" ") ||
    getDisplayNameFromEmail(emailUsuario);

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
      text: "Tendrás que volver a iniciar sesión para acceder a tu panel.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#7b8f34",
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

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <button
          className={styles.topbar__menu}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Abrir menú"
          type="button"
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        <div className={styles.topbar__brand}>
          <MdOutlineLocalShipping size={18} />
          <span>
            Logística · <strong>Conductor</strong>
          </span>
        </div>

        <div className={styles.topbar__right}>
          <div className={styles.topbar__meta}>
            <span className={styles.topbar__title}>{activeItem.label}</span>
            <small>{connected ? "En línea" : "Sin conexión"}</small>
          </div>

          <div
            className={`${styles.topbar__ws} ${
              connected ? styles["topbar__ws--on"] : ""
            }`}
            title={connected ? "En línea" : "Sin conexión"}
          />
        </div>
      </header>

      <div
        className={`${styles.overlay} ${
          mobileOpen ? styles["overlay--active"] : ""
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`${styles.drawer} ${
          mobileOpen ? styles["drawer--open"] : ""
        }`}
      >
        <div className={styles.drawer__head}>
          <div className={styles.drawer__brand}>
            <div className={styles.drawer__brandIcon}>
              <MdOutlineLocalShipping size={18} />
            </div>
            <div className={styles.drawer__brandText}>
              <strong>Panel conductor</strong>
              <span>Gestión operativa personal</span>
            </div>
          </div>
        </div>

        <div className={styles.drawer__user}>
          <div className={styles.drawer__avatar}>{iniciales}</div>
          <div className={styles.drawer__userMeta}>
            <p className={styles.drawer__nombre}>{nombreUsuario}</p>
            <span className={styles.drawer__email}>{emailUsuario}</span>
          </div>
        </div>

        <div className={styles.drawer__status}>
          <span
            className={`${styles.drawer__statusDot} ${
              connected ? styles["drawer__statusDot--on"] : ""
            }`}
          />
          <span className={styles.drawer__statusText}>
            {connected ? "Conexión en tiempo real activa" : "Sin conexión en tiempo real"}
          </span>
        </div>

        <div className={styles.drawer__context}>
          <p>{activeItem.title}</p>
          <span>{activeItem.description}</span>
        </div>

        <nav className={styles.drawer__nav} aria-label="Navegación del conductor">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                className={`${styles.drawer__navItem} ${
                  isActive ? styles["drawer__navItem--active"] : ""
                }`}
                onClick={() => handleNav(item.id)}
                type="button"
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          className={styles.drawer__logout}
          onClick={handleLogout}
          type="button"
        >
          <FiLogOut size={15} />
          Cerrar sesión
        </button>
      </aside>

      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`${styles.bottomNav__item} ${
                isActive ? styles["bottomNav__item--active"] : ""
              }`}
              onClick={() => handleNav(item.id)}
              type="button"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <main className={styles.main}>
        <div className={styles.main__header}>
          <div>
            <span className={styles.main__eyebrow}>Operación diaria</span>
            <h2>{activeItem.title}</h2>
            <p>{activeItem.description}</p>
          </div>
        </div>

        <div className={styles.main__content}>{renderContent(activeTab)}</div>
      </main>
    </div>
  );
};

export default ConductorWrapper;