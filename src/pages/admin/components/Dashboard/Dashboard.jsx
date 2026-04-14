import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiPackage, FiUsers, FiTruck, FiMapPin } from 'react-icons/fi'
import { fetchOrdenes } from '../../../../store/thunks/ordenesThunks'
import { fetchConductores } from '../../../../store/thunks/conductoresThunks'
import styles from './Dashboard.module.scss'

const ESTADOS_COLOR = {
  pendiente:   'pending',
  asignada:    'info',
  en_ruta:     'active',
  en_punto:    'warning',
  recogida:    'active',
  en_kiosco:   'done',
  en_almacen:  'success',
  cancelada:   'danger',
}

const KPICard = ({ icon: Icon, label, value, sub, color = 'main' }) => (
  <div className={`${styles.kpi} ${styles[`kpi--${color}`]}`}>
    <div className={styles.kpi__icon}><Icon size={22} /></div>
    <div className={styles.kpi__body}>
      <p className={styles.kpi__value}>{value ?? '—'}</p>
      <p className={styles.kpi__label}>{label}</p>
      {sub && <p className={styles.kpi__sub}>{sub}</p>}
    </div>
  </div>
)

const EstadoBadge = ({ estado }) => (
  <span className={`${styles.badge} ${styles[`badge--${ESTADOS_COLOR[estado] || 'neutral'}`]}`}>
    {estado.replace(/_/g, ' ')}
  </span>
)

const Dashboard = () => {
  const dispatch    = useDispatch()
  const { lista: ordenes, loading } = useSelector((s) => s.ordenes)
  const { lista: conductores } = useSelector((s) => s.conductores)

  useEffect(() => {
    dispatch(fetchOrdenes({ limit: 100 }))
  }, [dispatch])

  const porEstado = ordenes.reduce((acc, o) => {
    acc[o.estado] = (acc[o.estado] || 0) + 1
    return acc
  }, {})

  const activos      = conductores.filter((c) => c.disponible && c.activo).length
  const enRuta       = (porEstado.en_ruta || 0) + (porEstado.en_punto || 0)
  const completadas  = (porEstado.en_kiosco || 0) + (porEstado.en_almacen || 0)
  const pendientes   = porEstado.pendiente || 0

  const recientes = [...ordenes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>Resumen operacional en tiempo real</p>
      </header>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <KPICard icon={FiPackage}  label="Órdenes pendientes"  value={pendientes}  color="warning" />
        <KPICard icon={FiTruck}    label="En ruta ahora"        value={enRuta}      color="active"  />
        <KPICard icon={FiUsers}    label="Conductores activos"  value={activos}     color="info"    />
        <KPICard icon={FiMapPin}   label="Completadas hoy"      value={completadas} color="success" />
      </div>

      {/* Resumen por estado */}
      <section className={styles.section}>
        <h2 className={styles.section__title}>Estado de órdenes</h2>
        <div className={styles.estadoGrid}>
          {Object.entries(porEstado).map(([estado, cnt]) => (
            <div key={estado} className={styles.estadoCard}>
              <EstadoBadge estado={estado} />
              <p className={styles.estadoCard__count}>{cnt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabla recientes */}
      <section className={styles.section}>
        <h2 className={styles.section__title}>Órdenes recientes</h2>
        {loading ? (
          <p className={styles.loading}>Cargando...</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((o) => (
                  <tr key={o._id}>
                    <td><code className={styles.code}>{o.codigo}</code></td>
                    <td>{o.cliente?.nombre || '—'}</td>
                    <td>{o.tipo?.replace(/_/g, ' ')}</td>
                    <td>
                      <span className={`${styles.badge} ${o.prioridad === 'urgente' ? styles['badge--danger'] : styles['badge--neutral']}`}>
                        {o.prioridad}
                      </span>
                    </td>
                    <td><EstadoBadge estado={o.estado} /></td>
                  </tr>
                ))}
                {!recientes.length && (
                  <tr><td colSpan={5} className={styles.empty}>Sin órdenes registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
export default Dashboard