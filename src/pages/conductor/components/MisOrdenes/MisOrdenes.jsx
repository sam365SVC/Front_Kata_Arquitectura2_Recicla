import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrdenes } from '../../../../store/thunks/ordenesThunks'
import styles from './MisOrdenes.module.scss'

const ESTADO_COLOR = {
  pendiente: 'pending', asignada: 'info', en_ruta: 'active',
  en_punto: 'warning', recogida: 'active', en_kiosco: 'done',
  en_almacen: 'success', cancelada: 'danger',
}

const Badge = ({ estado }) => (
  <span className={`${styles.badge} ${styles[`badge--${ESTADO_COLOR[estado] || 'neutral'}`]}`}>
    {estado?.replace(/_/g, ' ')}
  </span>
)

const MisOrdenes = () => {
  const dispatch = useDispatch()
  const { lista, loading } = useSelector((s) => s.ordenes)

  // DEV_MODE: en producción filtrar por conductor autenticado
  // conductorId vendría de useSelector(s => s.auth.user.userId)
  useEffect(() => {
    dispatch(fetchOrdenes({ limit: 50 }))
  }, [dispatch])

  const activas     = lista.filter((o) => ['asignada', 'en_ruta', 'en_punto', 'recogida'].includes(o.estado))
  const completadas = lista.filter((o) => ['en_kiosco', 'en_almacen'].includes(o.estado))
  const canceladas  = lista.filter((o) => o.estado === 'cancelada')

  const renderGroup = (title, items, emptyMsg) => (
    <section className={styles.group}>
      <h2 className={styles.group__title}>{title} <span>{items.length}</span></h2>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyMsg}</p>
      ) : items.map((o) => (
        <div key={o._id} className={styles.card}>
          <div className={styles.card__top}>
            <code className={styles.code}>{o.codigo}</code>
            <Badge estado={o.estado} />
          </div>
          <p className={styles.card__cliente}>{o.cliente?.nombre}</p>
          {o.origen?.direccion && (
            <p className={styles.card__dir}>{o.origen.direccion}</p>
          )}
          <div className={styles.card__equipos}>
            {o.equipos?.map((eq, i) => (
              <span key={i} className={styles.equipo}>
                {eq.marca} {eq.modelo}
              </span>
            ))}
          </div>
          {o.ruta?.distanciaKm && (
            <p className={styles.card__ruta}>
              {o.ruta.distanciaKm} km · {o.ruta.tiempoEstimadoMin} min estimados
            </p>
          )}
          <p className={styles.card__fecha}>
            {new Date(o.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ))}
    </section>
  )

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>Mis órdenes</h1>
        <p>{activas.length} activas · {completadas.length} completadas</p>
      </header>

      {loading ? (
        <p className={styles.loading}>Cargando...</p>
      ) : (
        <>
          {renderGroup('Activas', activas, 'Sin órdenes activas')}
          {renderGroup('Completadas', completadas, 'Aún no has completado órdenes')}
          {canceladas.length > 0 && renderGroup('Canceladas', canceladas, '')}
        </>
      )}
    </div>
  )
}

export default MisOrdenes