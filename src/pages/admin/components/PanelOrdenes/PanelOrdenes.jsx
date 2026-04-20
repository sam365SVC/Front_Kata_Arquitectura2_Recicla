import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiSearch, FiPlus, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { fetchOrdenes, cambiarEstadoOrden, cancelarOrden } from '../../../../store/thunks/ordenesThunks'
import { setPage } from '../../../../store/slices/ordenesSlice'
import styles from './PanelOrdenes.module.scss'

const ESTADOS = ['', 'pendiente', 'asignada', 'en_ruta', 'en_punto', 'recogida', 'en_kiosco', 'en_almacen', 'cancelada']
const ESTADO_COLOR = {
  pendiente: 'pending', asignada: 'info', en_ruta: 'active',
  en_punto: 'warning', recogida: 'active', en_kiosco: 'done',
  en_almacen: 'success', cancelada: 'danger',
}

const TRANSICIONES = {
  pendiente:  ['asignada', 'cancelada'],
  asignada:   ['en_ruta', 'cancelada'],
  en_ruta:    ['en_punto'],
  en_punto:   ['recogida'],
  recogida:   ['en_kiosco', 'en_almacen'],
  en_kiosco:  ['en_almacen'],
}

const Badge = ({ estado }) => (
  <span className={`${styles.badge} ${styles[`badge--${ESTADO_COLOR[estado] || 'neutral'}`]}`}>
    {estado?.replace(/_/g, ' ')}
  </span>
)

const PanelOrdenes = () => {
  const dispatch = useDispatch()
  const { lista, total, page, loading } = useSelector((s) => s.ordenes)

  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroProoidad, setFiltroPrioridad] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [ordenSelec, setOrdenSelec] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState('')

  const LIMIT = 15

  useEffect(() => {
    dispatch(fetchOrdenes({
      estado:    filtroEstado    || undefined,
      prioridad: filtroProoidad  || undefined,
      page,
      limit: LIMIT,
    }))
  }, [dispatch, filtroEstado, filtroProoidad, page])

  const filtradas = lista.filter((o) =>
    busqueda
      ? o.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        o.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      : true
  )

  const handleCambioEstado = async () => {
    if (!ordenSelec || !nuevoEstado) return
    await dispatch(cambiarEstadoOrden({ id: ordenSelec._id, estado: nuevoEstado }))
    setOrdenSelec(null); setNuevoEstado('')
    dispatch(fetchOrdenes({ estado: filtroEstado || undefined, page, limit: LIMIT }))
  }

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Cancelar esta orden?')) return
    await dispatch(cancelarOrden({ id, motivo: 'Cancelada desde el panel' }))
    dispatch(fetchOrdenes({ page, limit: LIMIT }))
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Órdenes de recogida</h1>
          <p>{total} órdenes en total</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => {}}>
          <FiPlus size={15} /> Nueva orden
        </button>
      </header>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} size={15} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por código o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select className={styles.select} value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); dispatch(setPage(1)) }}>
          {ESTADOS.map((e) => <option key={e} value={e}>{e || 'Todos los estados'}</option>)}
        </select>

        <select className={styles.select} value={filtroProoidad} onChange={(e) => { setFiltroPrioridad(e.target.value); dispatch(setPage(1)) }}>
          <option value="">Toda prioridad</option>
          <option value="normal">Normal</option>
          <option value="urgente">Urgente</option>
        </select>

        <button className={styles.btnIcon} onClick={() => dispatch(fetchOrdenes({ page, limit: LIMIT }))}>
          <FiRefreshCw size={15} />
        </button>
      </div>

      {/* Tabla */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Creada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className={styles.empty}>Cargando...</td></tr>
              ) : filtradas.length === 0 ? (
                <tr><td colSpan={7} className={styles.empty}>Sin resultados</td></tr>
              ) : filtradas.map((o) => (
                <tr key={o._id}>
                  <td><code className={styles.code}>{o.codigo}</code></td>
                  <td>{o.cliente?.nombre || '—'}</td>
                  <td className={styles.tdMuted}>{o.tipo?.replace(/_/g, ' ')}</td>
                  <td>
                    <span className={`${styles.badge} ${o.prioridad === 'urgente' ? styles['badge--danger'] : styles['badge--neutral']}`}>
                      {o.prioridad}
                    </span>
                  </td>
                  <td><Badge estado={o.estado} /></td>
                  <td className={styles.tdMuted}>
                    {new Date(o.createdAt).toLocaleDateString('es-BO')}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {TRANSICIONES[o.estado]?.length > 0 && (
                        <button className={styles.btnAction} onClick={() => { setOrdenSelec(o); setNuevoEstado('') }}>
                          Cambiar estado
                        </button>
                      )}
                      {!['en_almacen', 'cancelada'].includes(o.estado) && (
                        <button className={`${styles.btnAction} ${styles['btnAction--danger']}`} onClick={() => handleCancelar(o._id)}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={page === 1} onClick={() => dispatch(setPage(page - 1))}>
              <FiChevronLeft size={15} />
            </button>
            <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
            <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => dispatch(setPage(page + 1))}>
              <FiChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Modal cambio de estado */}
      {ordenSelec && (
        <div className={styles.modalOverlay} onClick={() => setOrdenSelec(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Cambiar estado</h3>
            <p className={styles.modal__sub}>Orden: <code>{ordenSelec.codigo}</code></p>
            <p className={styles.modal__sub}>Estado actual: <Badge estado={ordenSelec.estado} /></p>

            <select className={styles.select} value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
              <option value="">Seleccionar nuevo estado...</option>
              {(TRANSICIONES[ordenSelec.estado] || []).map((e) => (
                <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
              ))}
            </select>

            <div className={styles.modal__actions}>
              <button className={styles.btnSecondary} onClick={() => setOrdenSelec(null)}>Cancelar</button>
              <button className={styles.btnPrimary} disabled={!nuevoEstado} onClick={handleCambioEstado}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelOrdenes