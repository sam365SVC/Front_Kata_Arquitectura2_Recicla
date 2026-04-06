import React, { useState, useEffect, useMemo } from "react";
import {
  FiClipboard, FiClock, FiCheckSquare,
  FiMenu, FiChevronLeft, FiChevronRight, FiLogOut,
} from "react-icons/fi";
import { MdOutlineDevices } from "react-icons/md";

import styles from "./ClientOffersWrapper.module.scss";
import MisCotizaciones from "./components/MisCotizaciones";

const NAV_ITEMS = [
    {
        id:          "cotizaciones",
        label:       "Mis Cotizaciones",
        icon:        FiClipboard,
        title:       "Mis cotizaciones",
        description: "Gestiona y revisa todas tus solicitudes de valoración de dispositivos.",
    },
    {
        id:          "historial",
        label:       "Historial",
        icon:        FiClock,
        title:       "Historial de actividad",
        description: "Revisa el historial completo de tus movimientos anteriores.",
        disabled:    true,
    },
    {
        id:          "aprobadas",
        label:       "Aprobadas",
        icon:        FiCheckSquare,
        title:       "Cotizaciones aprobadas",
        description: "Todas las cotizaciones que fueron aprobadas y pagadas.",
        disabled:    true,
    },
];

const renderContent = (tab) => {
    switch (tab) {
        case "cotizaciones":
        return <MisCotizaciones />;
        default:
        return (
            <div
            style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                height:         "60vh",
                gap:            12,
                fontFamily:     "'Nunito', sans-serif",
            }}
            >
            <FiClock size={40} color="#BDB77C" />
            <p style={{ fontSize: 16, fontWeight: 700, color: "#4D5756" }}>
                Próximamente disponible
            </p>
            </div>
        );
    }
};

const ClientOffersWrapper = ({
  clienteNombre = "Cliente",
  clienteEmail  = "cliente@email.com",
}) => {
    const [activeTab,   setActiveTab]   = useState("cotizaciones");
    const [collapsed,   setCollapsed]   = useState(false);
    const [mobileOpen,  setMobileOpen]  = useState(false);

    const activeItem = useMemo(
        () => NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0],
        [activeTab],
    );

    // Iniciales del nombre
    const iniciales = clienteNombre
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();

    // responsive
    useEffect(() => {
        const handle = () => {
        if (window.innerWidth > 991) { setMobileOpen(false); }
        if (window.innerWidth <= 991) { setCollapsed(false); }
        };
        handle();
        window.addEventListener("resize", handle);
        return () => window.removeEventListener("resize", handle);
    }, []);

    const handleNav = (id) => {
        setActiveTab(id);
        setMobileOpen(false);
    };

    const sidebarClass = [
        styles.sidebar,
        collapsed   ? styles["sidebar--collapsed"]   : "",
        mobileOpen  ? styles["sidebar--mobileOpen"]  : "",
    ].filter(Boolean).join(" ");

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
            <h2>Valoración <span>Pro</span></h2>
            <p>{activeItem.label}</p>
            </div>
        </div>

        {/* móvil */}
        <div
            className={`${styles.overlay} ${mobileOpen ? styles["overlay--active"] : ""}`}
            onClick={() => setMobileOpen(false)}
        />

        <div className={styles.shell}>

            <aside className={sidebarClass}>

            <div className={styles.sidebar__brand}>
                <div className={styles.sidebar__brandIcon}>
                <MdOutlineDevices size={22} />
                </div>
                <div className={styles.sidebar__brandText}>
                <h1>Valoración </h1>
                <p>Panel de cliente</p>
                </div>
            </div>

            <button
                className={styles.sidebar__toggleBtn}
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expandir" : "Colapsar"}
            >
                {collapsed ? <FiChevronRight size={13} /> : <FiChevronLeft size={13} />}
            </button>

            {/* Info panel del ítem activo */}
            <div className={styles.sidebar__infoPanel}>
                <p>{activeItem.emoji || ""} {activeItem.title}</p>
                <span>{activeItem.description}</span>
            </div>

            {/* Navegación */}
            <nav className={styles.sidebar__nav} aria-label="Navegación del cliente">
                {NAV_ITEMS.map((item) => {
                const Icon  = item.icon;
                const isAct = activeTab === item.id;
                return (
                    <button
                    key={item.id}
                    className={[
                        styles.sidebar__navItem,
                        isAct        ? styles["sidebar__navItem--active"]   : "",
                        item.disabled ? styles["sidebar__navItem--disabled"] : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => !item.disabled && handleNav(item.id)}
                    title={collapsed ? item.label : undefined}
                    aria-current={isAct ? "page" : undefined}
                    >
                    <span className={styles.sidebar__navIcon}><Icon size={18} /></span>
                    <span className={styles.sidebar__navLabel}>{item.label}</span>
                    {item.disabled && (
                        <span className={styles.sidebar__navSoon}>Pronto</span>
                    )}
                    </button>
                );
                })}
            </nav>

            {/* Footer */}
            <div className={styles.sidebar__footer}>
                <div className={styles.sidebar__footerUser}>
                <div className={styles.sidebar__footerAvatar}>{iniciales}</div>
                <div className={styles.sidebar__footerInfo}>
                    <p>{clienteNombre}</p>
                    <span>{clienteEmail}</span>
                </div>
                <div className={styles.sidebar__footerAction}>
                    <FiLogOut size={15} />
                </div>
                </div>
            </div>
            </aside>

            <main className={styles.main}>
            

            <div className={styles.contentBody}>
                {renderContent(activeTab)}
            </div>
            </main>
        </div>
    </>
  );
}; export default ClientOffersWrapper;