
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiSend, FiRefreshCw, FiCheck } from 'react-icons/fi'
import { fetchPendientes, asignarConductor } from '../../../../store/thunks/despachoThunks'
import { fetchConductores } from '../../../../store/thunks/conductoresThunks'
import { clearRuta }  from '../../../../store/slices/despachoSlice'
import styles from './PanelDespacho.module.scss'

const PrioridadBadge = ({ p }) => (
  <span className={`${styles.badge} ${p === 'urgente' ? styles['badge--urgente'] : styles['badge--normal']}`}>
    {p}
  </span>
)

const PanelDespacho = () => {
  const dispatch = useDispatch()
  const { pendientes, rutaCalculada, loading } = useSelector((s) => s.despacho)
  const { lista: conductores }                 = useSelector((s) => s.conductores)

  const [selectedOrdenes,   setSelectedOrdenes]   = useState([])
  const [selectedConductor, setSelectedConductor] = useState('')
  const [asignando,         setAsignando]         = useState(false)

  useEffect(() => {
    dispatch(fetchPendientes())
    dispatch(fetchConductores({ disponible: true }))
  }, [dispatch])

  const toggleOrden = (id) => {
    setSelectedOrdenes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleAsignar = async () => {
    if (!selectedConductor || !selectedOrdenes.length) return
    setAsignando(true)
    await dispatch(asignarConductor({ conductorId: selectedConductor, ordenIds: selectedOrdenes }))
    setSelectedOrdenes([])
    setSelectedConductor('')
    setAsignando(false)
  }

  const disponibles = conductores.filter((c) => c.disponible && c.activo)

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Panel de despacho</h1>
          <p>{pendientes.length} órdenes pendientes sin asignar</p>
        </div>
        <button className={styles.btnIcon}
          onClick={() => { dispatch(fetchPendientes()); dispatch(fetchConductores({ disponible: true })) }}>
          <FiRefreshCw size={15} />
        </button>
      </header>

      <div className={styles.layout}>
        {/* ─── Columna izquierda: órdenes ─── */}
        <section className={styles.col}>
          <div className={styles.colHeader}>
            <h2>Órdenes pendientes</h2>
            {selectedOrdenes.length > 0 && (
              <span className={styles.selCount}>{selectedOrdenes.length} seleccionadas</span>
            )}
          </div>

          <div className={styles.ordenesList}>
            {loading && <p className={styles.loading}>Cargando...</p>}
            {!loading && pendientes.length === 0 && (
              <div className={styles.emptyState}>
                <FiCheck size={32} className={styles.emptyIcon} />
                <p>Sin órdenes pendientes</p>
              </div>
            )}
            {pendientes.map((o) => {
              const isSelected = selectedOrdenes.includes(o._id)
              return (
                <button
                  key={o._id}
                  className={`${styles.ordenCard} ${isSelected ? styles['ordenCard--selected'] : ''}`}
                  onClick={() => toggleOrden(o._id)}
                >
                  <div className={styles.ordenCard__check}>
                    {isSelected && <FiCheck size={12} />}
                  </div>
                  <div className={styles.ordenCard__body}>
                    <div className={styles.ordenCard__top}>
                      <code className={styles.code}>{o.codigo}</code>
                      <PrioridadBadge p={o.prioridad} />
                    </div>
                    <p className={styles.ordenCard__cliente}>{o.cliente?.nombre}</p>
                    <p className={styles.ordenCard__dir}>{o.origen?.direccion}</p>
                    <p className={styles.ordenCard__tipo}>{o.tipo?.replace(/_/g, ' ')}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── Columna derecha: asignación + resultado ─── */}
        <section className={styles.col}>
          <div className={styles.colHeader}>
            <h2>Asignación</h2>
          </div>

          <div className={styles.asignBox}>
            <label className={styles.label}>
              Conductor disponible
              <select className={styles.select} value={selectedConductor}
                onChange={(e) => setSelectedConductor(e.target.value)}>
                <option value="">Seleccionar conductor...</option>
                {disponibles.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nombreCache} · {c.vehiculo?.placa} ({c.vehiculo?.tipo})
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.resumen}>
              <p><strong>{selectedOrdenes.length}</strong> órdenes seleccionadas</p>
              <p><strong>{selectedConductor ? disponibles.find((c) => c._id === selectedConductor)?.nombreCache : '—'}</strong> conductor</p>
            </div>

            <button
              className={styles.btnDespachar}
              disabled={!selectedConductor || !selectedOrdenes.length || asignando}
              onClick={handleAsignar}
            >
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
                  <p className={styles.rutaStat__label}>Distancia</p>
                </div>
                <div className={styles.rutaStat}>
                  <p className={styles.rutaStat__val}>{rutaCalculada.tiempoEstimadoMin} min</p>
                  <p className={styles.rutaStat__label}>Tiempo est.</p>
                </div>
                <div className={styles.rutaStat}>
                  <p className={styles.rutaStat__val}>{rutaCalculada.waypoints?.length}</p>
                  <p className={styles.rutaStat__label}>Paradas</p>
                </div>
              </div>
              <ol className={styles.waypoints}>
                {rutaCalculada.waypoints?.map((w, i) => (
                  <li key={i} className={styles.waypoint}>
                    <span className={styles.waypoint__num}>{i + 1}</span>
                    <div>
                      <p className={styles.waypoint__nombre}>{w.nombre}</p>
                      <p className={styles.waypoint__tipo}>{w.tipo}</p>
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