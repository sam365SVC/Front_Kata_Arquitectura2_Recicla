import React, { useState, useEffect, useMemo } from 'react'
import {
  FiMap, FiList, FiUsers, FiMapPin,
  FiGrid, FiMenu, FiChevronLeft, FiChevronRight, FiLogOut,
} from 'react-icons/fi'
import { MdOutlineLocalShipping } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '../../socket/SocketContext'

import Dashboard from './components/Dashboard/Dashboard'
import MapaOperacional from './components/MapaOperacional/MapaOperacional'
import PanelOrdenes from './components/PanelOrdenes/PanelOrdenes'
import GestionConductores from './components/GestionConductores/GestionConductores'
import GestionUbicaciones from './components/GestionUbicaciones/GestionUbicaciones'

import styles from './AdminWrapper.module.scss'

const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Dashboard', icon: FiGrid,
    title: 'Dashboard general', description: 'Métricas y estado del sistema en tiempo real.',
  },
  {
    id: 'mapa', label: 'Mapa operacional', icon: FiMap,
    title: 'Mapa en tiempo real', description: 'Visualiza vehículos, kioscos y órdenes activas.',
  },
  {
    id: 'ordenes', label: 'Órdenes', icon: FiList,
    title: 'Gestión de órdenes', description: 'Crea, filtra y gestiona el ciclo de recogida.',
  },
  {
    id: 'conductores', label: 'Conductores', icon: FiUsers,
    title: 'Conductores', description: 'Administra conductores y su disponibilidad.',
  },
  {
    id: 'ubicaciones', label: 'Ubicaciones', icon: FiMapPin,
    title: 'Kioscos y almacén', description: 'Gestiona kioscos de acopio y el almacén central.',
  },
]

function renderContent(tab) {
  switch (tab) {
    case 'dashboard':   return <Dashboard />
    case 'mapa':        return <MapaOperacional />
    case 'ordenes':     return <PanelOrdenes />
    case 'conductores': return <GestionConductores />
    case 'ubicaciones': return <GestionUbicaciones />
    default:            return <Dashboard />
  }
}

const AdminWrapper = ({ nombreUsuario = 'Admin', emailUsuario = 'admin@logistics.com' }) => {
  const [activeTab,  setActiveTab]  = useState('dashboard')
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { connected, solicitarPosiciones } = useSocket()

  // Solicitar posiciones GPS al montar
  useEffect(() => {
    if (connected) solicitarPosiciones()
  }, [connected])

  // Responsive
  useEffect(() => {
    const handle = () => {
      if (window.innerWidth > 991) setMobileOpen(false)
      if (window.innerWidth <= 991) setCollapsed(false)
    }
    handle()
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const activeItem = useMemo(
    () => NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0],
    [activeTab]
  )

  const iniciales = nombreUsuario
    .split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  const handleNav = (id) => { setActiveTab(id); setMobileOpen(false) }

  const sidebarCls = [
    styles.sidebar,
    collapsed  ? styles['sidebar--collapsed']  : '',
    mobileOpen ? styles['sidebar--mobileOpen'] : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Mobile topbar */}
      <div className={styles.mobileBar}>
        <button className={styles.mobileBar__toggle} onClick={() => setMobileOpen(true)}>
          <FiMenu size={18} />
        </button>
        <div className={styles.mobileBar__info}>
          <h2>Logística <span>Admin</span></h2>
          <p>{activeItem.label}</p>
        </div>
        <div className={`${styles.mobileBar__ws} ${connected ? styles['mobileBar__ws--on'] : ''}`} />
      </div>

      <div className={`${styles.overlay} ${mobileOpen ? styles['overlay--active'] : ''}`}
        onClick={() => setMobileOpen(false)} />

      <div className={styles.shell}>
        <aside className={sidebarCls}>

          {/* Brand */}
          <div className={styles.sidebar__brand}>
            <div className={styles.sidebar__brandIcon}>
              <MdOutlineLocalShipping size={22} />
            </div>
            <div className={styles.sidebar__brandText}>
              <h1>Logística</h1>
              <p>Panel administrador</p>
            </div>
          </div>

          {/* Toggle collapse */}
          <button className={styles.sidebar__toggleBtn}
            onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <FiChevronRight size={13} /> : <FiChevronLeft size={13} />}
          </button>

          {/* Info panel */}
          <div className={styles.sidebar__infoPanel}>
            <p>{activeItem.title}</p>
            <span>{activeItem.description}</span>
          </div>

          {/* WS status */}
          <div className={styles.sidebar__wsStatus}>
            <span className={`${styles.sidebar__wsDot} ${connected ? styles['sidebar__wsDot--on'] : ''}`} />
            <span className={styles.sidebar__wsLabel}>
              {connected ? 'Tiempo real activo' : 'Sin conexión WS'}
            </span>
          </div>

          {/* Nav */}
          <nav className={styles.sidebar__nav}>
            {NAV_ITEMS.map((item) => {
              const Icon  = item.icon
              const isAct = activeTab === item.id
              return (
                <button
                  key={item.id}
                  className={[
                    styles.sidebar__navItem,
                    isAct ? styles['sidebar__navItem--active'] : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleNav(item.id)}
                  title={collapsed ? item.label : undefined}
                  aria-current={isAct ? 'page' : undefined}
                >
                  <span className={styles.sidebar__navIcon}><Icon size={18} /></span>
                  <span className={styles.sidebar__navLabel}>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className={styles.sidebar__footer}>
            <div className={styles.sidebar__footerUser}>
              <div className={styles.sidebar__footerAvatar}>{iniciales}</div>
              <div className={styles.sidebar__footerInfo}>
                <p>{nombreUsuario}</p>
                <span>{emailUsuario}</span>
              </div>
              <button className={styles.sidebar__footerAction} title="Cerrar sesión">
                <FiLogOut size={15} />
              </button>
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
  )
} 
export default AdminWrapper