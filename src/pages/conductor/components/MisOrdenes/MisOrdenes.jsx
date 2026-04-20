import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiMapPin, FiPackage, FiPhone } from 'react-icons/fi'
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

const CondTag = ({ c }) => {
  const cls = { excelente: 'success', bueno: 'active', regular: 'warning', malo: 'danger' }
  return <span className={`${styles.condTag} ${styles[`condTag--${cls[c] || 'neutral'}`]}`}>{c}</span>
}

const MisOrdenes = () => {
  const dispatch = useDispatch()
  const { lista, loading } = useSelector(s => s.ordenes)

  // DEV_MODE — filtrar por auth.userId cuando auth esté listo
  useEffect(() => { dispatch(fetchOrdenes({ limit: 50 })) }, [dispatch])

  const activas     = lista.filter(o => ['asignada', 'en_ruta', 'en_punto', 'recogida'].includes(o.estado))
  const completadas = lista.filter(o => ['en_kiosco', 'en_almacen'].includes(o.estado))
  const canceladas  = lista.filter(o => o.estado === 'cancelada')

  const renderCard = (o) => (
    <div key={o._id} className={styles.card}>
      {/* Cabecera */}
      <div className={styles.card__top}>
        <code className={styles.code}>{o.codigo}</code>
        <Badge estado={o.estado} />
      </div>

      {/* Cliente */}
      <div className={styles.card__clienteRow}>
        <FiPhone size={12} />
        <span className={styles.card__cliente}>{o.cliente?.nombre}</span>
        {o.cliente?.telefono && <span className={styles.card__tel}>{o.cliente.telefono}</span>}
      </div>

      {/* Dirección y referencia de recogida */}
      {o.origen?.direccion && (
        <div className={styles.card__origenRow}>
          <FiMapPin size={12} />
          <div>
            <p className={styles.card__dir}>{o.origen.direccion}</p>
            {o.origen.referencia && <p className={styles.card__ref}>{o.origen.referencia}</p>}
          </div>
        </div>
      )}

      {/* Equipos */}
      {o.equipos?.length > 0 && (
        <div className={styles.card__equipos}>
          <FiPackage size={12} />
          <div className={styles.card__equiposList}>
            {o.equipos.map((eq, i) => (
              <div key={i} className={styles.equipo}>
                <span className={styles.equipo__nombre}>{eq.marca} {eq.modelo}</span>
                {eq.condicion && <CondTag c={eq.condicion} />}
                {eq.descripcion && <p className={styles.equipo__desc}>{eq.descripcion}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distancia (sin tiempoEstimado) */}
      {o.ruta?.distanciaKm && (
        <p className={styles.card__ruta}>{o.ruta.distanciaKm} km de recorrido</p>
      )}

      <p className={styles.card__fecha}>
        {new Date(o.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
    </div>
  )

  const renderGroup = (title, items, emptyMsg) => (
    <section className={styles.group}>
      <h2 className={styles.group__title}>{title} <span className={styles.group__cnt}>{items.length}</span></h2>
      {items.length === 0
        ? <p className={styles.empty}>{emptyMsg}</p>
        : items.map(renderCard)
      }
    </section>
  )

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>Mis órdenes</h1>
        <p>{activas.length} activas · {completadas.length} completadas</p>
      </header>

      {loading ? <p className={styles.loading}>Cargando...</p> : (
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