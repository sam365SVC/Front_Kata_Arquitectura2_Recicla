import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiNavigation, FiCheck } from 'react-icons/fi'
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
const ICON_WAYPOINT = makeIcon('#79864B')
const ICON_DONE     = makeIcon('#1A7A56')

const MiRuta = () => {
  const dispatch = useDispatch()
  const { lista: ordenes } = useSelector((s) => s.ordenes)
  const { emitirGPS, completarWaypoint, connected } = useSocket()

  // DEV_MODE: conductor hardcodeado — cambiar a Redux auth cuando esté listo
  const conductorId = 'user_dev_001'

  const [miPos,       setMiPos]       = useState(null)
  const [trackingOn,  setTrackingOn]  = useState(false)
  const watchRef = useRef(null)

  // Órdenes asignadas a este conductor en estado activo
  const ordenActiva = ordenes.find((o) =>
    ['asignada', 'en_ruta', 'en_punto'].includes(o.estado)
  )

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
        emitirGPS({
          lat, lng,
          velocidad: speed ? Math.round(speed * 3.6) : 0,
          ordenId:   ordenActiva?._id || null,
          conductorId,
        })
      },
      (err) => console.error('[GPS]', err),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
    )
  }

  const detenerTracking = () => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
    setTrackingOn(false)
  }

  useEffect(() => () => detenerTracking(), [])

  const waypoints = ordenActiva?.ruta?.waypoints || []
  const rutaLine  = waypoints.filter((w) => w.lat && w.lng).map((w) => [w.lat, w.lng])
  const center    = miPos ? [miPos.lat, miPos.lng] : [-16.5, -68.15]

  return (
    <div className={styles.wrap}>
      {/* Estado de tracking */}
      <div className={styles.trackBar}>
        <div className={styles.trackBar__info}>
          <span className={`${styles.trackDot} ${trackingOn ? styles['trackDot--on'] : ''}`} />
          <span className={styles.trackLabel}>
            {trackingOn ? 'Enviando posición...' : 'GPS inactivo'}
          </span>
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

          {/* Mi posición */}
          {miPos && (
            <Marker position={[miPos.lat, miPos.lng]} icon={ICON_YO}>
              <Popup>Mi posición actual</Popup>
            </Marker>
          )}

          {/* Waypoints de la ruta */}
          {waypoints.map((w, i) => {
            if (!w.lat || !w.lng) return null
            return (
              <Marker key={i} position={[w.lat, w.lng]}
                icon={w.completado ? ICON_DONE : ICON_WAYPOINT}>
                <Popup>
                  <strong>{i + 1}. {w.nombre}</strong><br />
                  {w.tipo}<br />
                  {w.completado ? '✓ Completado' : 'Pendiente'}
                </Popup>
              </Marker>
            )
          })}

          {/* Línea de ruta */}
          {rutaLine.length > 1 && (
            <Polyline positions={rutaLine}
              pathOptions={{ color: '#79864B', weight: 3, dashArray: '6 4', opacity: 0.75 }} />
          )}
        </MapContainer>
      </div>

      {/* Waypoints lista */}
      {ordenActiva ? (
        <div className={styles.waypointsList}>
          <p className={styles.waypointsList__title}>
            Ruta activa — <code className={styles.code}>{ordenActiva.codigo}</code>
          </p>
          {waypoints.map((w, i) => (
            <div key={i} className={`${styles.wp} ${w.completado ? styles['wp--done'] : ''}`}>
              <div className={styles.wp__num}>{i + 1}</div>
              <div className={styles.wp__body}>
                <p className={styles.wp__nombre}>{w.nombre}</p>
                <p className={styles.wp__tipo}>{w.tipo}</p>
              </div>
              {!w.completado ? (
                <button className={styles.wp__btn}
                  onClick={() => completarWaypoint({ ordenId: ordenActiva._id, waypointIndex: i })}>
                  <FiCheck size={14} /> Llegué
                </button>
              ) : (
                <span className={styles.wp__done}><FiCheck size={14} /> Listo</span>
              )}
            </div>
          ))}
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