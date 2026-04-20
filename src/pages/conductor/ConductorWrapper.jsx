import React, { useState, useMemo } from 'react'
import { FiMap, FiList, FiMenu, FiLogOut } from 'react-icons/fi'
import { MdOutlineLocalShipping } from 'react-icons/md'
import { useSocket } from '../../socket/SocketContext'

import MiRuta     from './components/MiRuta/MiRuta'
import MisOrdenes from './components/MisOrdenes/MisOrdenes'

import styles from './ConductorWrapper.module.scss'

const NAV_ITEMS = [
  { id: 'ruta',    label: 'Mi ruta',    icon: FiMap,  title: 'Mi ruta activa',   description: 'Tu ruta actual con waypoints y GPS.' },
  { id: 'ordenes', label: 'Mis órdenes', icon: FiList, title: 'Mis órdenes',      description: 'Órdenes asignadas y su estado.' },
]

function renderContent(tab) {
  switch (tab) {
    case 'ruta':    return <MiRuta />
    case 'ordenes': return <MisOrdenes />
    default:        return <MiRuta />
  }
}

const ConductorWrapper = ({
  nombreUsuario = 'Conductor',
  emailUsuario  = 'conductor@logistics.com',
}) => {
  const [activeTab,  setActiveTab]  = useState('ruta')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { connected } = useSocket()

  const activeItem = useMemo(
    () => NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0], [activeTab]
  )

  const iniciales = nombreUsuario
    .split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()

  const handleNav = (id) => { setActiveTab(id); setMobileOpen(false) }

  return (
    <div className={styles.shell}>
      {/* ─── Topbar siempre visible ─── */}
      <header className={styles.topbar}>
        <button className={styles.topbar__menu} onClick={() => setMobileOpen((v) => !v)}>
          <FiMenu size={20} />
        </button>
        <div className={styles.topbar__brand}>
          <MdOutlineLocalShipping size={18} />
          <span>Logística · <strong>Conductor</strong></span>
        </div>
        <div className={`${styles.topbar__ws} ${connected ? styles['topbar__ws--on'] : ''}`} title={connected ? 'En línea' : 'Sin conexión'} />
      </header>

      <div className={`${styles.overlay} ${mobileOpen ? styles['overlay--active'] : ''}`}
        onClick={() => setMobileOpen(false)} />

      {/* ─── Drawer lateral (menú) ─── */}
      <aside className={`${styles.drawer} ${mobileOpen ? styles['drawer--open'] : ''}`}>
        <div className={styles.drawer__user}>
          <div className={styles.drawer__avatar}>{iniciales}</div>
          <div>
            <p className={styles.drawer__nombre}>{nombreUsuario}</p>
            <span className={styles.drawer__email}>{emailUsuario}</span>
          </div>
        </div>

        <nav className={styles.drawer__nav}>
          {NAV_ITEMS.map((item) => {
            const Icon  = item.icon
            const isAct = activeTab === item.id
            return (
              <button
                key={item.id}
                className={`${styles.drawer__navItem} ${isAct ? styles['drawer__navItem--active'] : ''}`}
                onClick={() => handleNav(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <button className={styles.drawer__logout}>
          <FiLogOut size={15} /> Cerrar sesión
        </button>
      </aside>

      {/* ─── Bottom nav (mobile) ─── */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const Icon  = item.icon
          const isAct = activeTab === item.id
          return (
            <button
              key={item.id}
              className={`${styles.bottomNav__item} ${isAct ? styles['bottomNav__item--active'] : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ─── Contenido ─── */}
      <main className={styles.main}>
        {renderContent(activeTab)}
      </main>
    </div>
  )
}

export default ConductorWrapper