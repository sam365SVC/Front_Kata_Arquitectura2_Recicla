import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { FiNavigation, FiCheck, FiPackage, FiMapPin, FiPhone } from 'react-icons/fi'
import { useSocket } from '../../../../socket/SocketContext'
import { fetchOrdenes } from '../../../../store/thunks/ordenesThunks'
import styles from './MiRuta.module.scss'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

const ordenarWaypoints = (waypoints = []) => {
  const conIndice = waypoints.map((w, index) => ({
    ...w,
    originalIndex: index,
  }))

  const recogidas = conIndice.filter(w => w.tipo === 'origen')
  const destinos = conIndice.filter(
    w => w.tipo === 'kiosco' || w.tipo === 'almacen_central'
  )

  return [...recogidas, ...destinos]
}

const CondicionBadge = ({ c }) => {
  const cls = {
    excelente: styles['cond--excelente'],
    bueno: styles['cond--bueno'],
    regular: styles['cond--regular'],
    malo: styles['cond--malo'],
  }

  return <span className={`${styles.cond} ${cls[c] || ''}`}>{c}</span>
}

const MARKER_COLOR = {
  done: '#1A7A56',
  destino: '#0e3b46',
  origen: '#79864B',
  yo: '#FC6441',
}

const MiRuta = () => {
  const dispatch = useDispatch()
  const { lista: ordenes } = useSelector((s) => s.ordenes)
  const loginUser = useSelector((s) => s.login?.user)

  const { emitirGPS, completarWaypoint, connected } = useSocket()

  const conductorId =
    loginUser?.id ||
    loginUser?._id ||
    loginUser?.uid ||
    loginUser?.user_id ||
    'user_dev_001'

  const [miPos, setMiPos] = useState(null)
  const [trackingOn, setTrackingOn] = useState(false)
  const [wpExpanded, setWpExpanded] = useState(null)
  const [mapReady, setMapReady] = useState(false)

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const watchRef = useRef(null)
  const miMarkerRef = useRef(null)
  const wpMarkersRef = useRef([])

  const ordenActiva = ordenes.find((o) =>
    ['asignada', 'en_ruta', 'en_punto'].includes(o.estado)
  )

  useEffect(() => {
    dispatch(fetchOrdenes({ estado: ['en_ruta', 'asignada'] }))
  }, [dispatch])

  const waypointsRaw = ordenActiva?.ruta?.waypoints || []

  const waypoints = useMemo(() => {
    const conIndiceOriginal = waypointsRaw.map((wp, originalIndex) => ({
      ...wp,
      originalIndex,
    }))

    return ordenarWaypoints(conIndiceOriginal)
  }, [waypointsRaw])

  const proximoIdx = waypoints.findIndex((w) => !w.completado)

  const centerCoords =
    waypoints[0]?.lat && waypoints[0]?.lng
      ? [waypoints[0].lng, waypoints[0].lat]
      : [-68.15, -16.5]

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: centerCoords,
      zoom: 13,
      attributionControl: false,
    })

    mapRef.current.addControl(
      new mapboxgl.AttributionControl({ compact: true })
    )
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    )

    mapRef.current.on('load', () => setMapReady(true))

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  const dibujarRuta = useCallback(
    async (wps, posChofer) => {
      const map = mapRef.current
      if (!map || !mapReady) return

      const coordsValidas = wps.filter((w) => w.lat && w.lng)
      if (coordsValidas.length < 1) return

      const puntosRuta = posChofer
        ? [{ lng: posChofer.lng, lat: posChofer.lat }, ...coordsValidas]
        : coordsValidas

      if (puntosRuta.length < 2) return

      const coordStr = puntosRuta.map((p) => `${p.lng},${p.lat}`).join(';')

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`
        )
        const data = await res.json()

        if (!data.routes?.length) return
        const geojson = data.routes[0].geometry

        if (map.getSource('ruta')) {
          map.getSource('ruta').setData({
            type: 'Feature',
            geometry: geojson,
          })
        } else {
          map.addSource('ruta', {
            type: 'geojson',
            data: { type: 'Feature', geometry: geojson },
          })

          map.addLayer({
            id: 'ruta-shadow',
            type: 'line',
            source: 'ruta',
            paint: {
              'line-color': 'rgba(0,0,0,0.15)',
              'line-width': 8,
              'line-blur': 4,
            },
          })

          map.addLayer({
            id: 'ruta-line',
            type: 'line',
            source: 'ruta',
            paint: {
              'line-color': '#79864B',
              'line-width': 4,
              'line-dasharray': [2, 1.5],
            },
          })
        }

        const bounds = new mapboxgl.LngLatBounds()
        puntosRuta.forEach((p) => bounds.extend([p.lng, p.lat]))
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 900 })
      } catch (err) {
        console.error('[OSRM ruta]', err)
      }
    },
    [mapReady]
  )

  const dibujarMarcadores = useCallback(
    (wps) => {
      const map = mapRef.current
      if (!map || !mapReady) return

      wpMarkersRef.current.forEach((m) => m.remove())
      wpMarkersRef.current = []

      const siguientePendienteIdx = wps.findIndex((wp) => !wp.completado)

      wps.forEach((w, i) => {
        if (!w.lat || !w.lng) return

        const esDestino =
          w.tipo === 'kiosco' || w.tipo === 'almacen_central'

        const color = w.completado
          ? MARKER_COLOR.done
          : esDestino
          ? MARKER_COLOR.destino
          : MARKER_COLOR.origen

        const el = document.createElement('div')
        el.style.cssText = `
          background: ${color};
          width: ${esDestino ? '32px' : '28px'};
          height: ${esDestino ? '32px' : '28px'};
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 11px;
          font-family: sans-serif;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          transition: transform 0.15s ease;
          ${
            i === siguientePendienteIdx
              ? 'box-shadow: 0 0 0 4px rgba(121,134,75,0.35), 0 2px 8px rgba(0,0,0,0.35);'
              : ''
          }
        `
        el.textContent = i + 1
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.15)'
        })
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
        })

        const popup = new mapboxgl.Popup({ offset: 20, closeButton: false })
          .setHTML(`
            <div style="font-family:sans-serif;padding:4px 2px">
              <strong style="font-size:13px">${i + 1}. ${w.nombre}</strong>
              <p style="margin:3px 0 0;font-size:11px;color:#666">${w.tipo?.replace(
                /_/g,
                ' '
              )}</p>
              ${
                w.completado
                  ? '<p style="margin:3px 0 0;font-size:11px;color:#1A7A56;font-weight:700">✓ Completado</p>'
                  : i === siguientePendienteIdx
                  ? '<p style="margin:3px 0 0;font-size:11px;color:#79864B;font-weight:700">⟳ Próxima parada</p>'
                  : '<p style="margin:3px 0 0;font-size:11px;color:#999">Pendiente</p>'
              }
            </div>
          `)

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([w.lng, w.lat])
          .setPopup(popup)
          .addTo(map)

        wpMarkersRef.current.push(marker)
      })
    },
    [mapReady]
  )

  useEffect(() => {
    if (!mapReady || !waypoints.length) return
    dibujarRuta(waypoints, miPos)
    dibujarMarcadores(waypoints)
  }, [mapReady, waypoints, miPos, dibujarRuta, dibujarMarcadores])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !miPos) return

    if (!miMarkerRef.current) {
      const el = document.createElement('div')
      el.style.cssText = `
        background: ${MARKER_COLOR.yo};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 4px rgba(252,100,65,0.3), 0 2px 8px rgba(0,0,0,0.4);
      `
      miMarkerRef.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([miPos.lng, miPos.lat])
        .setPopup(
          new mapboxgl.Popup({ closeButton: false }).setText('Mi posición')
        )
        .addTo(map)
    } else {
      miMarkerRef.current.setLngLat([miPos.lng, miPos.lat])
    }
  }, [miPos, mapReady])

  const iniciarTracking = () => {
    if (!navigator.geolocation) return

    setTrackingOn(true)

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed } = pos.coords

        setMiPos({ lat, lng })

        emitirGPS({
          lat,
          lng,
          velocidad: speed ? Math.round(speed * 3.6) : 0,
          ordenId: ordenActiva?._id || null,
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

  useEffect(() => {
    return () => detenerTracking()
  }, [])

  const getEquipoPorWp = (wpIdx) => ordenActiva?.equipos?.[wpIdx] || null

  return (
    <div className={styles.wrap}>
      <div className={styles.trackBar}>
        <div className={styles.trackBar__info}>
          <span
            className={`${styles.trackDot} ${
              trackingOn ? styles['trackDot--on'] : ''
            }`}
          />
          <span className={styles.trackLabel}>
            {trackingOn ? 'Enviando posición...' : 'GPS inactivo'}
          </span>
        </div>

        <button
          className={`${styles.trackBtn} ${
            trackingOn ? styles['trackBtn--stop'] : ''
          }`}
          onClick={trackingOn ? detenerTracking : iniciarTracking}
          disabled={!connected}
        >
          <FiNavigation size={14} />
          {trackingOn ? 'Detener GPS' : 'Iniciar GPS'}
        </button>
      </div>

      <div className={styles.mapWrap}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

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
            const esDestino =
              w.tipo === 'kiosco' || w.tipo === 'almacen_central'
            const esProximo = i === proximoIdx
            const equipo = !esDestino ? getEquipoPorWp(w.originalIndex) : null
            const isExpanded = wpExpanded === i

            return (
              <div
                key={w._id || `${w.tipo}-${w.originalIndex}-${i}`}
                className={`
                  ${styles.wp}
                  ${w.completado ? styles['wp--done'] : ''}
                  ${esProximo ? styles['wp--proximo'] : ''}
                  ${esDestino ? styles['wp--destino'] : ''}
                `}
              >
                <div className={styles.wp__main}>
                  <div
                    className={`${styles.wp__num} ${
                      esDestino ? styles['wp__num--destino'] : ''
                    }`}
                  >
                    {i + 1}
                  </div>

                  <div className={styles.wp__body}>
                    {esProximo && !w.completado && (
                      <span className={styles.wp__proximoTag}>
                        Próxima parada
                      </span>
                    )}

                    <p className={styles.wp__nombre}>{w.nombre}</p>
                    <p className={styles.wp__tipo}>
                      {w.tipo?.replace(/_/g, ' ')}
                    </p>

                    {w.direccion && (
                      <p className={styles.wp__dir}>
                        <FiMapPin size={11} /> {w.direccion}
                      </p>
                    )}

                    {w.referencia && (
                      <p className={styles.wp__ref}>{w.referencia}</p>
                    )}
                  </div>

                  {!w.completado ? (
                    <button
  className={styles.wp__btn}
  onClick={() =>
    completarWaypoint({
      ordenId: ordenActiva._id,
      waypointIndex: w.originalIndex,
      force: true,
    })
  }
>
  <FiCheck size={14} /> Llegué
</button>
                  ) : (
                    <span className={styles.wp__doneTag}>
                      <FiCheck size={14} /> Listo
                    </span>
                  )}
                </div>

                {!esDestino && (
                  <button
                    className={styles.wp__expandBtn}
                    onClick={() => setWpExpanded(isExpanded ? null : i)}
                  >
                    <FiPackage size={12} />
                    Ver equipo a recoger
                    <span className={styles.wp__expandArrow}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>
                )}

                {!esDestino && isExpanded && (
                  <div className={styles.wp__equipoCard}>
                    <div className={styles.equipoSec}>
                      <p className={styles.equipoSec__title}>Cliente</p>
                      <div className={styles.equipoRow}>
                        <FiPhone size={11} />
                        <span>
                          {ordenActiva.cliente?.nombre} ·{' '}
                          {ordenActiva.cliente?.telefono || 'Sin teléfono'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.equipoSec}>
                      <p className={styles.equipoSec__title}>
                        Dirección de recogida
                      </p>
                      <div className={styles.equipoRow}>
                        <FiMapPin size={11} />
                        <span>{ordenActiva.origen?.direccion || '—'}</span>
                      </div>

                      {ordenActiva.origen?.referencia && (
                        <p className={styles.equipoRef}>
                          {ordenActiva.origen.referencia}
                        </p>
                      )}
                    </div>

                    {equipo && (
                      <div className={styles.equipoSec}>
                        <p className={styles.equipoSec__title}>
                          Equipo a recoger
                        </p>

                        <div className={styles.equipoItem}>
                          <div className={styles.equipoItem__header}>
                            <span className={styles.equipoItem__nombre}>
                              {equipo.marca} {equipo.modelo}
                            </span>
                            <CondicionBadge c={equipo.condicion} />
                          </div>

                          <p className={styles.equipoItem__detalle}>
                            Antigüedad: {equipo.antiguedad} año
                            {equipo.antiguedad !== 1 ? 's' : ''}
                            {equipo.descripcion
                              ? ` · ${equipo.descripcion}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    )}

                    {!equipo && ordenActiva.equipos?.length > 0 && (
                      <div className={styles.equipoSec}>
                        <p className={styles.equipoSec__title}>
                          Equipos registrados
                        </p>

                        {ordenActiva.equipos.map((eq, ei) => (
                          <div key={ei} className={styles.equipoItem}>
                            <div className={styles.equipoItem__header}>
                              <span className={styles.equipoItem__nombre}>
                                {eq.marca} {eq.modelo}
                              </span>
                              <CondicionBadge c={eq.condicion} />
                            </div>
                            <p className={styles.equipoItem__detalle}>
                              Antigüedad: {eq.antiguedad} año
                              {eq.antiguedad !== 1 ? 's' : ''}
                              {eq.descripcion ? ` · ${eq.descripcion}` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {esDestino && (
                  <button
                    className={styles.wp__expandBtn}
                    onClick={() => setWpExpanded(isExpanded ? null : i)}
                  >
                    <FiMapPin size={12} /> Destino final
                    <span className={styles.wp__expandArrow}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>
                )}

                {esDestino && isExpanded && (
                  <div className={styles.wp__equipoCard}>
                    <p className={styles.equipoSec__title}>
                      Punto de entrega final
                    </p>
                    <p className={styles.equipoRow}>
                      <FiMapPin size={11} /> {w.nombre} ·{' '}
                      {w.tipo?.replace(/_/g, ' ')}
                    </p>
                  </div>
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