import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useSocket } from '../../../../socket/SocketContext'
import { fetchUbicaciones } from '../../../../store/thunks/ubicacionesThunks'
import styles from './MapaDespacho.module.scss'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="background:${color};border-radius:50%;width:14px;height:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
})

const ICON_VEHICULO = makeIcon('#FC6441')
const ICON_KIOSCO   = makeIcon('#BDB77C')
const ICON_ALMACEN  = makeIcon('#0e3b46')

const MapaDespacho = () => {
  const dispatch = useDispatch()
  const { lista: ubicaciones } = useSelector((s) => s.ubicaciones)
  const { posicionesGPS } = useSelector((s) => s.conductores)
  const { rutaCalculada } = useSelector((s) => s.despacho)
  const { connected, solicitarPosiciones } = useSocket()

  useEffect(() => {
    dispatch(fetchUbicaciones())
    if (connected) solicitarPosiciones()
  }, [dispatch, connected])

  const kioscos = ubicaciones.filter((u) => u.tipo === 'kiosco' && u.activo)
  const almacen = ubicaciones.find((u) => u.tipo === 'almacen_central' && u.activo)
  const vehiculos = Object.entries(posicionesGPS).filter(([, p]) => p.online)

  // Polilínea de la ruta calculada
  const rutaPolyline = rutaCalculada?.waypoints
    ?.filter((w) => w.lat && w.lng)
    .map((w) => [w.lat, w.lng]) || []

  const center = [-16.5, -68.15]

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Mapa de operaciones</h1>
          <p>{vehiculos.length} vehículos en línea · {kioscos.length} kioscos</p>
        </div>
        {rutaCalculada && (
          <div className={styles.rutaChip}>
            Ruta calculada: {rutaCalculada.distanciaKm} km · {rutaCalculada.tiempoEstimadoMin} min
          </div>
        )}
      </header>

      <div className={styles.mapWrap}>
        <MapContainer center={center} zoom={12} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Kioscos */}
          {kioscos.map((k) => {
            const [lng, lat] = k.coordenadas?.coordinates || []
            if (!lat || !lng) return null
            return (
              <Marker key={k._id} position={[lat, lng]} icon={ICON_KIOSCO}>
                <Popup><strong>{k.nombre}</strong><br />{k.direccion}</Popup>
              </Marker>
            )
          })}

          {/* Almacén */}
          {almacen && (() => {
            const [lng, lat] = almacen.coordenadas?.coordinates || []
            if (!lat || !lng) return null
            return (
              <Marker position={[lat, lng]} icon={ICON_ALMACEN}>
                <Popup><strong>{almacen.nombre}</strong><br />Almacén central</Popup>
              </Marker>
            )
          })()}

          {/* Vehículos GPS */}
          {vehiculos.map(([conductorId, pos]) => (
            <Marker key={conductorId} position={[pos.lat, pos.lng]} icon={ICON_VEHICULO}>
              <Popup>
                <strong>Conductor</strong><br />
                {pos.velocidad || 0} km/h
              </Popup>
            </Marker>
          ))}

          {/* Polilínea de la ruta calculada */}
          {rutaPolyline.length > 1 && (
            <Polyline positions={rutaPolyline}
              pathOptions={{ color: '#79864B', weight: 3, dashArray: '8 4', opacity: 0.8 }} />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapaDespacho