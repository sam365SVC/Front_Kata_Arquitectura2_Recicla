import React, { useEffect, useMemo, useState } from "react";
import {
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUsers,
  FiSettings,
  FiCreditCard,
  FiBarChart,
  FiCheck,
} from "react-icons/fi";
import { MdOutlineBusinessCenter } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import styles from "./AdminEmpresaWrapper.module.scss";
import UsuariosEmpresa from "./components/UsuariosEmpresa";
import TiposDispositivoEmpresa from "./components/TiposDispositivoEmpresa";
import PlanEmpresa from "./components/PlanEmpresa";
import ReportesReecicla from "./components/ReportesReecicla";
import PagosEmpresa from "./components/PagosEmpresa";

import { logout } from "../signin/slices/loginSlice";
import {
  selectTenantId,
  selectTenantName,
  selectUser,
} from "../signin/slices/loginSelectors";

const NAV_ITEMS = [
  {
    id: "usuariosEmpresa",
    label: "Usuarios de la empresa",
    icon: FiUsers,
    title: "Gestión de usuarios",
    description:
      "Administra empleados, accesos y usuarios asociados a la empresa.",
  },
  {
    id: "tiposDispositivo",
    label: "Tipos de dispositivos",
    icon: FiSettings,
    title: "Administración de dispositivos",
    description:
      "Configura qué dispositivos se recepcionan y qué condiciones serán consideradas.",
  },
  {
    id: "miPlan",
    label: "Mi plan",
    icon: FiCreditCard,
    title: "Plan y suscripción",
    description:
      "Revisa tu plan actual, sus beneficios, límites y opciones disponibles.",
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: FiBarChart,
    title: "Reportes",
    description:
      "Observa en graficas, estadisticas y rangos sobre tu negocio",
  },
  {
    id: "misPagos",
    label: "Mis pagos",
    icon: FiCheck,
    title: "Historial de pagos",
    description:
      "Revisa tu historial de pagos y detalles de transacciones.",

  },

];

const renderContent = (tab, props) => {
  switch (tab) {
    case "usuariosEmpresa":
      return <UsuariosEmpresa {...props} />;

    case "tiposDispositivo":
      return <TiposDispositivoEmpresa {...props} />;

    case "miPlan":
      return <PlanEmpresa {...props} />;
    
    case "reportes":
      return <ReportesReecicla {...props} />;

    case "misPagos":
      return <PagosEmpresa {...props} />;
    default:
      return <UsuariosEmpresa {...props} />;
  }
};

const getInitials = (name = "") => {
  if (!name.trim()) return "AE";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getDisplayNameFromEmail = (email = "") => {
  if (!email || !email.includes("@")) return "Administrador";

  const localPart = email.split("@")[0];

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const AdminEmpresaWrapper = ({
  empresaNombre: empresaNombreProp,
  adminNombre: adminNombreProp,
  adminEmail: adminEmailProp,
  tenantId: tenantIdProp,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const tenantIdState = useSelector(selectTenantId);
  const tenantNameState = useSelector(selectTenantName);

  const [activeTab, setActiveTab] = useState("usuariosEmpresa");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userEmail =
    adminEmailProp || user?.mail || user?.email || "sin-correo@empresa.com";

  const userName =
    adminNombreProp ||
    user?.nombres ||
    [user?.nombre, user?.apellido].filter(Boolean).join(" ") ||
    getDisplayNameFromEmail(userEmail);

  const empresaNombre =
    empresaNombreProp ||
    tenantNameState ||
    user?.tenantNombre ||
    "Mi empresa";

  const adminNombre = userName;
  const adminEmail = userEmail;
  const tenantId = tenantIdProp || tenantIdState || user?.tenantId || "";

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0],
    [activeTab]
  );

  const iniciales = useMemo(() => getInitials(adminNombre), [adminNombre]);

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

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tendrás que volver a iniciar sesión para acceder al panel.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#78793F",
      cancelButtonColor: "#B0B0B0",
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
                <p title={adminNombre}>{adminNombre}</p>
                <span title={empresaNombre}>{empresaNombre}</span>
                <small title={adminEmail}>{adminEmail}</small>
              </div>

              <button
                type="button"
                className={styles.sidebar__footerAction}
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <FiLogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.contentBody}>
            {renderContent(activeTab, {
              tenantId,
              empresaNombre,
              adminNombre,
              adminEmail,
            })}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminEmpresaWrapper;