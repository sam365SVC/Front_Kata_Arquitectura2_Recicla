import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useSocket } from '../../../../socket/SocketContext'
import { fetchOrdenes }  from '../../../../store/thunks/ordenesThunks'
import { fetchUbicaciones } from '../../../../store/thunks/ubicacionesThunks'
import styles from './MapaOperacional.module.scss'

// Fix Leaflet default icon path (problema conocido con webpack/vite)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Iconos personalizados por tipo
const makeIcon = (color, label) => L.divIcon({
  className: '',
  html: `<div style="
    background:${color};border-radius:50%;width:14px;height:14px;
    border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const ICON_DOMICILIO = makeIcon('#79864B')   // main-1 — recogida pendiente
const ICON_KIOSCO  = makeIcon('#BDB77C')   // main-3 — kiosco
const ICON_ALMACEN = makeIcon('#0e3b46')   // black  — almacén
const ICON_VEHICULO = makeIcon('#FC6441')   // orange — vehículo en ruta

const OcupacionBar = ({ pct }) => {
  const color = pct >= 90 ? '#B82020' : pct >= 70 ? '#946900' : '#1A7A56'
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: '0.3s' }} />
      </div>
      <p style={{ fontSize: 11, margin: '3px 0 0', color }}>{pct}% ocupado</p>
    </div>
  )
}

const MapaOperacional = () => {
  const dispatch = useDispatch()
  const { lista: ordenes } = useSelector((s) => s.ordenes)
  const { lista: ubicaciones } = useSelector((s) => s.ubicaciones)
  const { posicionesGPS } = useSelector((s) => s.conductores)
  const { connected, solicitarPosiciones } = useSocket()

  useEffect(() => {
    dispatch(fetchOrdenes({ estado: 'pendiente', limit: 200 }))
    dispatch(fetchUbicaciones())
    if (connected) solicitarPosiciones()
  }, [dispatch, connected])

  // La Paz, Bolivia como centro por defecto
  const center = [-16.5, -68.15]

  const ordenesActivas = ordenes.filter((o) =>
    ['pendiente', 'asignada', 'en_ruta', 'en_punto'].includes(o.estado)
  )

  const kioscos  = ubicaciones.filter((u) => u.tipo === 'kiosco' && u.activo)
  const almacen  = ubicaciones.find((u) => u.tipo === 'almacen_central' && u.activo)
  const vehiculos = Object.entries(posicionesGPS).filter(([, p]) => p.online)

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Mapa operacional</h1>
          <p>{ordenesActivas.length} órdenes activas · {kioscos.length} kioscos · {vehiculos.length} vehículos en línea</p>
        </div>
        <div className={`${styles.wsChip} ${connected ? styles['wsChip--on'] : ''}`}>
          <span className={styles.wsDot} />
          {connected ? 'Tiempo real' : 'Sin WS'}
        </div>
      </header>

      {/* Leyenda */}
      <div className={styles.leyenda}>
        {[
          { color: '#79864B', label: 'Recogida pendiente' },
          { color: '#BDB77C', label: 'Kiosco' },
          { color: '#0e3b46', label: 'Almacén' },
          { color: '#FC6441', label: 'Vehículo' },
        ].map((l) => (
          <div key={l.label} className={styles.leyenda__item}>
            <span className={styles.leyenda__dot} style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.mapWrap}>
        <MapContainer center={center} zoom={12} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Órdenes — puntos de recogida */}
          {ordenesActivas.map((o) => {
            const [lng, lat] = o.origen?.coordenadas?.coordinates || []
            if (!lat || !lng) return null
            return (
              <Marker key={o._id} position={[lat, lng]} icon={ICON_DOMICILIO}>
                <Popup>
                  <strong>{o.codigo}</strong><br />
                  {o.cliente?.nombre}<br />
                  <span style={{ fontSize: 12, color: '#79864B' }}>{o.estado}</span>
                </Popup>
              </Marker>
            )
          })}

          {/* Kioscos */}
          {kioscos.map((k) => {
            const [lng, lat] = k.coordenadas?.coordinates || []
            if (!lat || !lng) return null
            return (
              <React.Fragment key={k._id}>
                <Marker position={[lat, lng]} icon={ICON_KIOSCO}>
                  <Popup>
                    <strong>{k.nombre}</strong><br />
                    {k.direccion}<br />
                    {k.ocupacionPct != null && <OcupacionBar pct={k.ocupacionPct} />}
                  </Popup>
                </Marker>
                {/* Radio visual del kiosco */}
                <Circle center={[lat, lng]} radius={200}
                  pathOptions={{ color: '#BDB77C', fillColor: '#BDB77C', fillOpacity: 0.08, weight: 1 }} />
              </React.Fragment>
            )
          })}

          {/* Almacén central */}
          {almacen && (() => {
            const [lng, lat] = almacen.coordenadas?.coordinates || []
            if (!lat || !lng) return null
            return (
              <Marker position={[lat, lng]} icon={ICON_ALMACEN}>
                <Popup><strong>{almacen.nombre}</strong><br />Almacén central</Popup>
              </Marker>
            )
          })()}

          {/* Vehículos en tiempo real */}
          {vehiculos.map(([conductorId, pos]) => (
            <Marker key={conductorId} position={[pos.lat, pos.lng]} icon={ICON_VEHICULO}>
              <Popup>
                <strong>Conductor</strong><br />
                Velocidad: {pos.velocidad || 0} km/h<br />
                <span style={{ fontSize: 11, color: '#999' }}>{pos.timestamp}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
export default MapaOperacional