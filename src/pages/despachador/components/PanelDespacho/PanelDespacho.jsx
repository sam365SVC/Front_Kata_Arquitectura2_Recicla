import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiSend, FiRefreshCw, FiCheck, FiPackage, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'
import { fetchPendientes, asignarConductor } from '../../../../store/thunks/despachoThunks'
import { fetchConductores } from '../../../../store/thunks/conductoresThunks'
import { clearRuta } from '../../../../store/slices/despachoSlice'
import styles from './PanelDespacho.module.scss'

const PrioridadBadge = ({ p }) => (
  <span className={`${styles.badge} ${p === 'urgente' ? styles['badge--urgente'] : styles['badge--normal']}`}>{p}</span>
)

const CondicionDot = ({ c }) => {
  const map = { excelente: 'success', bueno: 'active', regular: 'warning', malo: 'danger' }
  return <span className={`${styles.condDot} ${styles[`condDot--${map[c] || 'neutral'}`]}`}>{c}</span>
}

const PanelDespacho = () => {
  const dispatch = useDispatch()
  const { pendientes, rutaCalculada, loading } = useSelector(s => s.despacho)
  const { lista: conductores } = useSelector(s => s.conductores)

  const [selectedOrdenes,   setSelectedOrdenes]   = useState([])
  const [selectedConductor, setSelectedConductor] = useState('')
  const [asignando, setAsignando] = useState(false)
  const [expandida, setExpandida] = useState(null)
  console.log(pendientes)

  useEffect(() => {
    dispatch(fetchPendientes())
    dispatch(fetchConductores({ disponible: true }))
  }, [dispatch])

  const toggleOrden  = (id) => setSelectedOrdenes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleDetalle = (id) => setExpandida(prev => prev === id ? null : id)

  const handleAsignar = async () => {
    if (!selectedConductor || !selectedOrdenes.length) return
    setAsignando(true)
    await dispatch(asignarConductor({ conductorId: selectedConductor, ordenIds: selectedOrdenes }))
    setSelectedOrdenes([])
    setSelectedConductor('')
    setAsignando(false)
  }

  const disponibles = conductores.filter(c => c.disponible && c.activo)

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Panel de despacho</h1>
          <p>{pendientes.length} órdenes pendientes sin asignar</p>
        </div>
        <button className={styles.btnIcon} onClick={() => { dispatch(fetchPendientes()); dispatch(fetchConductores({ disponible: true })) }}>
          <FiRefreshCw size={15} />
        </button>
      </header>

      <div className={styles.layout}>
        {/* ─── Columna izquierda: órdenes ─── */}
        <section className={styles.col}>
          <div className={styles.colHeader}>
            <h2>Órdenes pendientes</h2>
            {selectedOrdenes.length > 0 && <span className={styles.selCount}>{selectedOrdenes.length} seleccionadas</span>}
          </div>

          <div className={styles.ordenesList}>
            {loading && <p className={styles.loading}>Cargando...</p>}
            {!loading && pendientes.length === 0 && (
              <div className={styles.emptyState}>
                <FiCheck size={32} className={styles.emptyIcon} />
                <p>Sin órdenes pendientes</p>
              </div>
            )}

            {pendientes.map(o => {
              const isSelected = selectedOrdenes.includes(o._id)
              const isExpanded = expandida === o._id
              return (
                <div key={o._id} className={`${styles.ordenCard} ${isSelected ? styles['ordenCard--selected'] : ''}`}>
                  {/* Fila principal — selecciona la orden */}
                  <div className={styles.ordenCard__main} onClick={() => toggleOrden(o._id)}>
                    <div className={styles.ordenCard__check}>{isSelected && <FiCheck size={12} />}</div>
                    <div className={styles.ordenCard__body}>
                      <div className={styles.ordenCard__top}>
                        <code className={styles.code}>{o.codigo}</code>
                        <PrioridadBadge p={o.prioridad} />
                      </div>
                      <div className={styles.ordenCard__clienteRow}>
                        <FiUser size={12} />
                        <span className={styles.ordenCard__cliente}>{o.cliente?.nombre}</span>
                        {o.cliente?.telefono && <span className={styles.ordenCard__tel}>{o.cliente.telefono}</span>}
                      </div>
                      <div className={styles.ordenCard__origenRow}>
                        <FiMapPin size={12} />
                        <span className={styles.ordenCard__dir}>{o.origen?.direccion || '—'}</span>
                      </div>
                      {o.origen?.referencia && (
                        <p className={styles.ordenCard__ref}>{o.origen.referencia}</p>
                      )}
                    </div>
                  </div>

                  {/* Botón expandir para ver equipos */}
                  <button className={styles.ordenCard__expandBtn} onClick={(e) => { 
                    e.stopPropagation(); // EVITA QUE SE SELECCIONE LA ORDEN AL EXPANDIR
                    toggleDetalle(o._id); 
                  }}>
                    <FiPackage size={13} />
                    {o.equipos?.length || 0} equipo{o.equipos?.length !== 1 ? 's' : ''}
                    <span className={styles.ordenCard__expandArrow}>{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {/* Detalle de equipos — se despliega */}
                  {isExpanded && o.equipos?.map((eq, i) => (
                    <div key={i} className={styles.equipoDetail}>
                      <div className={styles.equipoDetail__row}>
                        <span className={styles.equipoDetail__label}>Equipo</span>
                        <span className={styles.equipoDetail__val}>{eq.marca} {eq.modelo}</span>
                      </div>
                      <div className={styles.equipoDetail__row}>
                        <span className={styles.equipoDetail__label}>Condición</span>
                        <CondicionDot c={eq.condicion} />
                      </div>
                      <div className={styles.equipoDetail__row}>
                        <span className={styles.equipoDetail__label}>Antigüedad</span>
                        <span className={styles.equipoDetail__val}>{eq.antiguedad} año{eq.antiguedad !== 1 ? 's' : ''}</span>
                      </div>
                      {eq.descripcion && (
                        <div className={styles.equipoDetail__row}>
                          <span className={styles.equipoDetail__label}>Descripción</span>
                          <span className={styles.equipoDetail__desc}>{eq.descripcion}</span>
                        </div>
                      )}
                      {eq.fotos?.length > 0 && (
                        <div className={styles.equipoDetail__row}>
                          <span className={styles.equipoDetail__label}>Fotos</span>
                          <span className={styles.equipoDetail__val}>{eq.fotos.length} foto{eq.fotos.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Columna derecha: asignación + resultado ─── */}
        <section className={styles.col}>
          <div className={styles.colHeader}><h2>Asignación</h2></div>

          <div className={styles.asignBox}>
            <label className={styles.label}>
              Conductor disponible
              <select className={styles.select} value={selectedConductor} onChange={e => setSelectedConductor(e.target.value)}>
                <option value="">Seleccionar conductor...</option>
                {disponibles.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.nombreCache} · {c.vehiculo?.placa} ({c.vehiculo?.tipo})
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.resumen}>
              <p><strong>{selectedOrdenes.length}</strong> órdenes seleccionadas</p>
              <p><strong>{selectedConductor ? disponibles.find(c => c._id === selectedConductor)?.nombreCache : '—'}</strong> conductor</p>
            </div>

            <button className={styles.btnDespachar} disabled={!selectedConductor || !selectedOrdenes.length || asignando} onClick={handleAsignar}>
              <FiSend size={16} />
              {asignando ? 'Calculando ruta...' : 'Despachar y calcular ruta'}
            </button>
          </div>

          {/* Resultado de la ruta */}
          {rutaCalculada && (
            <div className={styles.rutaResult}>
              <div className={styles.rutaResult__header}>
                <h3>Ruta calculada</h3>
                <button className={styles.btnClear} onClick={() => dispatch(clearRuta())}>Limpiar</button>
              </div>
              <div className={styles.rutaStats}>
                <div className={styles.rutaStat}>
                  <p className={styles.rutaStat__val}>{rutaCalculada.distanciaKm} km</p>
                  <p className={styles.rutaStat__label}>Distancia total</p>
                </div>
                <div className={styles.rutaStat}>
                  <p className={styles.rutaStat__val}>{rutaCalculada.waypoints?.length}</p>
                  <p className={styles.rutaStat__label}>Paradas</p>
                </div>
              </div>
              <ol className={styles.waypoints}>
                {rutaCalculada.waypoints?.map((w, i) => (
                  <li key={i} className={styles.waypoint}>
                    <span className={`${styles.waypoint__num} ${['kiosco','almacen_central'].includes(w.tipo) ? styles['waypoint__num--destino'] : ''}`}>
                      {i + 1}
                    </span>
                    <div className={styles.waypoint__info}>
                      <p className={styles.waypoint__nombre}>{w.nombre}</p>
                      <p className={styles.waypoint__tipo}>{w.tipo?.replace(/_/g, ' ')}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default PanelDespacho