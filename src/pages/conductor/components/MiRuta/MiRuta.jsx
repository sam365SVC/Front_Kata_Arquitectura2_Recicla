import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiNavigation, FiCheck, FiPackage, FiMapPin, FiPhone } from 'react-icons/fi'
import { useSocket } from '../../../../socket/SocketContext'
import { fetchOrdenes } from '../../../../store/thunks/ordenesThunks'
import styles from './MiRuta.module.scss'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color, size = 14) => L.divIcon({
  className: '',
  html: `<div style="background:${color};border-radius:50%;width:${size}px;height:${size}px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [size, size], iconAnchor: [size / 2, size / 2],
})

const ICON_YO       = makeIcon('#FC6441', 18)
const ICON_RECOGIDA = makeIcon('#79864B', 14)
const ICON_DESTINO  = makeIcon('#0e3b46', 16)
const ICON_DONE     = makeIcon('#1A7A56', 14)

/**
 * Reorganiza los waypoints asegurando que kiosco y almacen_central
 * siempre queden al final del arreglo como punto final de la ruta.
 */
const ordenarWaypoints = (waypoints) => {
  const recogidas = waypoints.filter(w => w.tipo === 'origen')
  const destinos  = waypoints.filter(w => w.tipo === 'kiosco' || w.tipo === 'almacen_central')
  return [...recogidas, ...destinos]
}

const CondicionBadge = ({ c }) => {
  const cls = { excelente: styles['cond--excelente'], bueno: styles['cond--bueno'], regular: styles['cond--regular'], malo: styles['cond--malo'] }
  return <span className={`${styles.cond} ${cls[c] || ''}`}>{c}</span>
}

const MiRuta = () => {
  const dispatch = useDispatch()
  const { lista: ordenes } = useSelector(s => s.ordenes)
  const { emitirGPS, completarWaypoint, connected } = useSocket()

  // reemplazar con auth
  const conductorId = 'user_dev_001'

  const [miPos,       setMiPos]       = useState(null)
  const [trackingOn,  setTrackingOn]  = useState(false)
  const [wpExpanded, setWpExpanded] = useState(null) // índice del waypoint con detalle abierto
  const watchRef = useRef(null)

  const ordenActiva = ordenes.find(o => ['asignada', 'en_ruta', 'en_punto'].includes(o.estado))

  useEffect(() => {
    dispatch(fetchOrdenes({ estado: ['en_ruta', 'asignada'] }))
  }, [dispatch])

  // GPS del navegador \
  const iniciarTracking = () => {
    if (!navigator.geolocation) return
    setTrackingOn(true)
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed } = pos.coords
        setMiPos({ lat, lng })
        emitirGPS({ lat, lng, velocidad: speed ? Math.round(speed * 3.6) : 0, ordenId: ordenActiva?._id || null, conductorId })
      },
      (err) => console.error('[GPS]', err),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
    )
  }

  const detenerTracking = () => {
    if (watchRef.current) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null }
    setTrackingOn(false)
  }

  useEffect(() => () => detenerTracking(), [])

  // Waypoints reordenados: recogidas primero, destinos al final
  const waypointsRaw     = ordenActiva?.ruta?.waypoints || []
  const waypoints        = ordenarWaypoints(waypointsRaw)
  const rutaLine         = waypoints.filter(w => w.lat && w.lng).map(w => [w.lat, w.lng])
  const center           = miPos ? [miPos.lat, miPos.lng] : waypoints[0]?.lat ? [waypoints[0].lat, waypoints[0].lng] : [-16.5, -68.15]
  const proximoIdx       = waypoints.findIndex(w => !w.completado)

  // Búsqueda de datos del equipo correspondiente a un waypoint de origen
  // Usa el índice original para mantener coherencia con el backend
  const getEquipoPorWp = (wpIdx) => {
    return ordenActiva?.equipos?.[wpIdx] || null
  }

  return (
    <div className={styles.wrap}>
      {/* Track bar */}
      <div className={styles.trackBar}>
        <div className={styles.trackBar__info}>
          <span className={`${styles.trackDot} ${trackingOn ? styles['trackDot--on'] : ''}`} />
          <span className={styles.trackLabel}>{trackingOn ? 'Enviando posición...' : 'GPS inactivo'}</span>
        </div>
        <button
          className={`${styles.trackBtn} ${trackingOn ? styles['trackBtn--stop'] : ''}`}
          onClick={trackingOn ? detenerTracking : iniciarTracking}
          disabled={!connected}
        >
          <FiNavigation size={14} />
          {trackingOn ? 'Detener GPS' : 'Iniciar GPS'}
        </button>
      </div>

      {/* Mapa */}
      <div className={styles.mapWrap}>
        <MapContainer center={center} zoom={14} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {miPos && (
            <Marker position={[miPos.lat, miPos.lng]} icon={ICON_YO}>
              <Popup>Mi posición actual</Popup>
            </Marker>
          )}

          {waypoints.map((w, i) => {
            if (!w.lat || !w.lng) return null
            const esDestino = w.tipo === 'kiosco' || w.tipo === 'almacen_central'
            const icon = w.completado ? ICON_DONE : esDestino ? ICON_DESTINO : ICON_RECOGIDA
            return (
              <Marker key={i} position={[w.lat, w.lng]} icon={icon}>
                <Popup>
                  <strong>{i + 1}. {w.nombre}</strong><br />
                  {w.tipo?.replace(/_/g, ' ')}<br />
                  {w.completado ? '✓ Completado' : i === proximoIdx ? '⟳ Próxima parada' : 'Pendiente'}
                </Popup>
              </Marker>
            )
          })}

          {rutaLine.length > 1 && (
            <Polyline positions={rutaLine} pathOptions={{ color: '#79864B', weight: 3, dashArray: '6 4', opacity: 0.75 }} />
          )}
        </MapContainer>
      </div>

      {/* Lista de waypoints */}
      {ordenActiva ? (
        <div className={styles.waypointsList}>
          <div className={styles.waypointsList__header}>
            <p className={styles.waypointsList__title}>
              Ruta activa — <code className={styles.code}>{ordenActiva.codigo}</code>
            </p>
            <p className={styles.waypointsList__dist}>
              {ordenActiva.ruta?.distanciaKm} km total
            </p>
          </div>

          {waypoints.map((w, i) => {
            const esDestino  = w.tipo === 'kiosco' || w.tipo === 'almacen_central'
            const esProximo  = i === proximoIdx
            const equipo     = !esDestino ? getEquipoPorWp(waypointsRaw.indexOf(w)) : null
            const isExpanded = wpExpanded === i

            return (
              <div key={i} className={`${styles.wp} ${w.completado ? styles['wp--done'] : ''} ${esProximo ? styles['wp--proximo'] : ''} ${esDestino ? styles['wp--destino'] : ''}`}>
                {/* Fila principal */}
                <div className={styles.wp__main}>
                  <div className={`${styles.wp__num} ${esDestino ? styles['wp__num--destino'] : ''}`}>{i + 1}</div>
                  <div className={styles.wp__body}>
                    {esProximo && !w.completado && <span className={styles.wp__proximoTag}>Próxima parada</span>}
                    <p className={styles.wp__nombre}>{w.nombre}</p>
                    <p className={styles.wp__tipo}>{w.tipo?.replace(/_/g, ' ')}</p>
                    {w.direccion && <p className={styles.wp__dir}><FiMapPin size={11} /> {w.direccion}</p>}
                    {w.referencia && <p className={styles.wp__ref}>{w.referencia}</p>}
                  </div>

                  {!w.completado ? (
                    <button className={styles.wp__btn}
                      onClick={() => completarWaypoint({ ordenId: ordenActiva._id, waypointIndex: waypointsRaw.indexOf(w) })}>
                      <FiCheck size={14} /> Llegué
                    </button>
                  ) : (
                    <span className={styles.wp__doneTag}><FiCheck size={14} /> Listo</span>
                  )}
                </div>

                {/* Info del equipo para paradas de recogida */}
                {!esDestino && (
                  <button className={styles.wp__expandBtn} onClick={() => setWpExpanded(isExpanded ? null : i)}>
                    <FiPackage size={12} />
                    Ver equipo a recoger
                    <span className={styles.wp__expandArrow}>{isExpanded ? '▲' : '▼'}</span>
                  </button>
                )}

                {!esDestino && isExpanded && (
                  <div className={styles.wp__equipoCard}>
                    {/* Datos del cliente */}
                    <div className={styles.equipoSec}>
                      <p className={styles.equipoSec__title}>Cliente</p>
                      <div className={styles.equipoRow}>
                        <FiPhone size={11} />
                        <span>{ordenActiva.cliente?.nombre} · {ordenActiva.cliente?.telefono || 'Sin teléfono'}</span>
                      </div>
                    </div>

                    {/* Origen */}
                    <div className={styles.equipoSec}>
                      <p className={styles.equipoSec__title}>Dirección de recogida</p>
                      <div className={styles.equipoRow}>
                        <FiMapPin size={11} />
                        <span>{ordenActiva.origen?.direccion || '—'}</span>
                      </div>
                      {ordenActiva.origen?.referencia && (
                        <p className={styles.equipoRef}>{ordenActiva.origen.referencia}</p>
                      )}
                    </div>

                    {/* Equipos */}
                    {ordenActiva.equipos?.length > 0 && (
                      <div className={styles.equipoSec}>
                        <p className={styles.equipoSec__title}>Equipos a recoger</p>
                        {ordenActiva.equipos.map((eq, ei) => (
                          <div key={ei} className={styles.equipoItem}>
                            <div className={styles.equipoItem__header}>
                              <span className={styles.equipoItem__nombre}>{eq.marca} {eq.modelo}</span>
                              <CondicionBadge c={eq.condicion} />
                            </div>
                            <p className={styles.equipoItem__detalle}>
                              Antigüedad: {eq.antiguedad} año{eq.antiguedad !== 1 ? 's' : ''}
                              {eq.descripcion && ` · ${eq.descripcion}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Destino final: info del kiosco/almacén */}
                {esDestino && isExpanded && (
                  <div className={styles.wp__equipoCard}>
                    <p className={styles.equipoSec__title}>Punto de entrega final</p>
                    <p className={styles.equipoRow}><FiMapPin size={11} /> {w.nombre} · {w.tipo?.replace(/_/g, ' ')}</p>
                  </div>
                )}

                {esDestino && (
                  <button className={styles.wp__expandBtn} onClick={() => setWpExpanded(isExpanded ? null : i)}>
                    <FiMapPin size={12} /> Destino final
                    <span className={styles.wp__expandArrow}>{isExpanded ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.sinRuta}>
          <p>No tienes ruta asignada</p>
          <span>Espera a que el despachador te asigne una orden.</span>
        </div>
      )}
    </div>
  )
}

export default MiRuta