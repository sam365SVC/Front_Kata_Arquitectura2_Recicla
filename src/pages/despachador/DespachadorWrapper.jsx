import React, { useState, useEffect, useMemo } from 'react'
import { FiSend, FiMap, FiMenu, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi'
import { MdOutlineLocalShipping } from 'react-icons/md'
import { useSocket } from '../../socket/SocketContext'

import PanelDespacho from './components/PanelDespacho/PanelDespacho'
import MapaDespacho  from './components/MapaDespacho/MapaDespacho'

import styles from './DespachadorWrapper.module.scss'

const NAV_ITEMS = [
  {
    id: 'despacho', label: 'Panel de despacho', icon: FiSend,
    title: 'Panel de despacho',
    description: 'Asigna conductores a órdenes pendientes y calcula rutas óptimas.',
  },
  {
    id: 'mapa', label: 'Mapa de operaciones', icon: FiMap,
    title: 'Mapa de operaciones',
    description: 'Visualiza en tiempo real la posición de vehículos y órdenes.',
  },
]

function renderContent(tab) {
  switch (tab) {
    case 'despacho': return <PanelDespacho />
    case 'mapa':     return <MapaDespacho />
    default:         return <PanelDespacho />
  }
}

const DespachadorWrapper = ({
  nombreUsuario = 'Despachador',
  emailUsuario  = 'despacho@logistics.com',
}) => {
  const [activeTab,  setActiveTab]  = useState('despacho')
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { connected, solicitarPosiciones } = useSocket()

  useEffect(() => {
    if (connected) solicitarPosiciones()
  }, [connected])

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
      <div className={styles.mobileBar}>
        <button className={styles.mobileBar__toggle} onClick={() => setMobileOpen(true)}>
          <FiMenu size={18} />
        </button>
        <div className={styles.mobileBar__info}>
          <h2>Logística <span>Despacho</span></h2>
          <p>{activeItem.label}</p>
        </div>
        <div className={`${styles.mobileBar__ws} ${connected ? styles['mobileBar__ws--on'] : ''}`} />
      </div>

      <div className={`${styles.overlay} ${mobileOpen ? styles['overlay--active'] : ''}`}
        onClick={() => setMobileOpen(false)} />

      <div className={styles.shell}>
        <aside className={sidebarCls}>

          <div className={styles.sidebar__brand}>
            <div className={styles.sidebar__brandIcon}><MdOutlineLocalShipping size={22} /></div>
            <div className={styles.sidebar__brandText}>
              <h1>Logística</h1>
              <p>Despachador</p>
            </div>
          </div>

          <button className={styles.sidebar__toggleBtn}
            onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <FiChevronRight size={13} /> : <FiChevronLeft size={13} />}
          </button>

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

          <div className={styles.sidebar__footer}>
            <div className={styles.sidebar__footerUser}>
              <div className={styles.sidebar__footerAvatar}>{iniciales}</div>
              <div className={styles.sidebar__footerInfo}>
                <p>{nombreUsuario}</p>
                <span>{emailUsuario}</span>
              </div>
              <button className={styles.sidebar__footerAction}><FiLogOut size={15} /></button>
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

export default DespachadorWrapper