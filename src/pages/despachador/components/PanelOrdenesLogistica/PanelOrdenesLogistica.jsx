import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

import { fetchOrdenes } from '../../../../store/thunks/ordenesThunks'
import { recibirOrdenYEnviarAInspeccionThunk } from '../../../../store/thunks/orchestrationThunks'
import { setPage } from '../../../../store/slices/ordenesSlice'

import styles from './PanelOrdenesLogistica.module.scss'

const ESTADO_COLOR = {
  pendiente: 'pending',
  asignada: 'info',
  en_ruta: 'active',
  en_punto: 'warning',
  recogida: 'active',
  en_kiosco: 'done',
  en_almacen: 'success',
  cancelada: 'danger',
}

const ESTADOS_FILTRO = [
  '',
  'pendiente',
  'asignada',
  'en_ruta',
  'en_punto',
  'recogida',
  'en_kiosco',
  'en_almacen',
  'cancelada',
]

const Badge = ({ estado }) => (
  <span
    className={`${styles.badge} ${
      styles[`badge--${ESTADO_COLOR[estado] || 'neutral'}`]
    }`}
  >
    {estado?.replace(/_/g, ' ')}
  </span>
)

const EquipoTag = ({ eq }) => (
  <span className={styles.equipo}>
    {eq.marca} {eq.modelo} · {eq.condicion || '—'}
  </span>
)

const PanelOrdenesLogistica = () => {
  const dispatch = useDispatch()

  const { lista, total, page, loading } = useSelector((s) => s.ordenes)
  const { lista: conductores } = useSelector((s) => s.conductores)

  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroConductor, setFiltroConductor] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [confirmOrden, setConfirmOrden] = useState(null)
  const [procesandoRecepcion, setProcesandoRecepcion] = useState(false)

  const LIMIT = 15

  const cargarOrdenes = () => {
    dispatch(
      fetchOrdenes({
        estado: filtroEstado || undefined,
        conductorId: filtroConductor || undefined,
        page,
        limit: LIMIT,
      })
    )
  }

  useEffect(() => {
    cargarOrdenes()
  }, [dispatch, filtroEstado, filtroConductor, page])

  const filtradas = lista.filter((o) =>
    busqueda
      ? o.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        o.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      : true
  )

  const handleConfirmarRecepcion = async () => {
    if (!confirmOrden || procesandoRecepcion) return

    try {
      setProcesandoRecepcion(true)

      const solicitudCotizacionId =
        confirmOrden?.solicitudCotizacionId ||
        confirmOrden?.solicitud_cotizacion_id ||
        confirmOrden?.solicitudId ||
        confirmOrden?.solicitud?._id ||
        confirmOrden?.solicitud?.id ||
        null

      if (!solicitudCotizacionId) {
        throw new Error('La orden no tiene solicitudCotizacionId')
      }

      const response = await dispatch(
        recibirOrdenYEnviarAInspeccionThunk({
          idOrden: confirmOrden._id,
          payload: {
            forzar: true,
            solicitudCotizacionId,
          },
        })
      ).unwrap()

      await Swal.fire({
        icon: 'success',
        title: 'Orden recibida',
        text:
          response?.message ||
          'La orden fue recibida y enviada correctamente a inspección.',
        confirmButtonColor: '#7b8f34',
      })

      setConfirmOrden(null)

      dispatch(
        fetchOrdenes({
          estado: filtroEstado || undefined,
          conductorId: filtroConductor || undefined,
          page,
          limit: LIMIT,
        })
      )
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo procesar',
        text:
          error?.message ||
          error ||
          'No se pudo recibir la orden y enviarla a inspección.',
        confirmButtonColor: '#7b8f34',
      })
    } finally {
      setProcesandoRecepcion(false)
    }
  }

  const puedeRecibirEnAlmacen = (orden) =>
    ['recogida', 'en_kiosco'].includes(orden.estado)

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Órdenes</h1>
          <p>{total} órdenes · solo confirmación de recepción en almacén</p>
        </div>

        <button
          className={styles.btnIcon}
          onClick={cargarOrdenes}
          type="button"
          disabled={loading}
        >
          <FiRefreshCw size={15} />
        </button>
      </header>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} size={15} />
          <input
            className={styles.searchInput}
            placeholder="Código o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select
          className={styles.select}
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value)
            dispatch(setPage(1))
          }}
        >
          {ESTADOS_FILTRO.map((estado) => (
            <option key={estado} value={estado}>
              {estado || 'Todos los estados'}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filtroConductor}
          onChange={(e) => {
            setFiltroConductor(e.target.value)
            dispatch(setPage(1))
          }}
        >
          <option value="">Todos los conductores</option>
          {conductores.map((conductor) => (
            <option key={conductor._id} value={conductor._id}>
              {conductor.nombreCache} · {conductor.vehiculo?.placa}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Equipos</th>
                <th>Origen</th>
                <th>Conductor</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    Cargando...
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filtradas.map((orden) => (
                  <tr key={orden._id}>
                    <td>
                      <code className={styles.code}>{orden.codigo}</code>
                    </td>

                    <td>
                      <p className={styles.clienteNombre}>
                        {orden.cliente?.nombre}
                      </p>
                      <p className={styles.clienteTel}>
                        {orden.cliente?.telefono}
                      </p>
                    </td>

                    <td>
                      <div className={styles.equipos}>
                        {orden.equipos?.map((eq, i) => (
                          <EquipoTag key={i} eq={eq} />
                        ))}
                      </div>
                    </td>

                    <td>
                      <p className={styles.dirLine}>
                        {orden.origen?.direccion || '—'}
                      </p>
                      {orden.origen?.referencia && (
                        <p className={styles.refLine}>
                          {orden.origen.referencia}
                        </p>
                      )}
                    </td>

                    <td className={styles.tdMuted}>
                      {orden.conductor?.nombre || '—'}
                    </td>

                    <td>
                      <span
                        className={`${styles.badge} ${
                          orden.prioridad === 'urgente'
                            ? styles['badge--danger']
                            : styles['badge--neutral']
                        }`}
                      >
                        {orden.prioridad}
                      </span>
                    </td>

                    <td>
                      <Badge estado={orden.estado} />
                    </td>

                    <td>
                      {puedeRecibirEnAlmacen(orden) && (
                        <button
                          className={styles.btnRecibir}
                          onClick={() => setConfirmOrden(orden)}
                          type="button"
                        >
                          <FiPackage size={13} /> Recibir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => dispatch(setPage(page - 1))}
              type="button"
            >
              <FiChevronLeft size={15} />
            </button>

            <span className={styles.pageInfo}>
              Página {page} de {totalPages}
            </span>

            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => dispatch(setPage(page + 1))}
              type="button"
            >
              <FiChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {confirmOrden && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            if (!procesandoRecepcion) setConfirmOrden(null)
          }}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirmar recepción en almacén</h3>

            <div className={styles.modal__info}>
              <p>
                <strong>Orden:</strong>{' '}
                <code className={styles.code}>{confirmOrden.codigo}</code>
              </p>

              <p>
                <strong>Cliente:</strong> {confirmOrden.cliente?.nombre}
              </p>

              <p>
                <strong>Solicitud relacionada:</strong>{' '}
                {confirmOrden.solicitudCotizacionId || 'No disponible'}
              </p>

              {confirmOrden.equipos?.map((eq, i) => (
                <div key={i} className={styles.modal__equipo}>
                  <FiPackage size={13} />
                  <span>
                    {eq.marca} {eq.modelo} — {eq.condicion} — antigüedad:{' '}
                    {eq.antiguedad} años
                  </span>
                </div>
              ))}
            </div>

            <p className={styles.modal__warn}>
              Esta acción marcará la orden como recibida en almacén central y la
              enviará a inspección.
            </p>

            <div className={styles.modal__actions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setConfirmOrden(null)}
                type="button"
                disabled={procesandoRecepcion}
              >
                Cancelar
              </button>

              <button
                className={styles.btnPrimary}
                onClick={handleConfirmarRecepcion}
                type="button"
                disabled={procesandoRecepcion}
              >
                {procesandoRecepcion
                  ? 'Procesando...'
                  : 'Confirmar recepción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelOrdenesLogistica