import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { store } from '../store/index'
import { updateGPSConductor, setConductorOffline } from '../store/slices/conductoresSlice'
import { updateWaypoint } from '../store/slices/ordenesSlice'

// DEV_MODE: sin token en el handshake — el servidor acepta sin auth
const SOCKET_URL = "http://localhost:3000";

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(SOCKET_URL, {
  path: "/logistics-socket",
  transports: ["websocket", "polling"],
  auth: {
    token: store.getState().auth.token,
  },
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[WS] Conectado:', socket.id)
      setConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('[WS] Desconectado:', reason)
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('[WS] Error de conexión:', err.message)
    })

    // Eventos entrantes — despachan a Redux

    // Posición GPS de un conductor en tiempo real
    socket.on('gps:conductor', (data) => {
      store.dispatch(updateGPSConductor(data))
    })

    // Conductor se desconectó — limpiar del mapa
    socket.on('conductor:offline', ({ conductorId }) => {
      store.dispatch(setConductorOffline(conductorId))
    })

    // Waypoint completado por el conductor
    socket.on('orden:waypoint', (data) => {
      store.dispatch(updateWaypoint(data))
    })

    // Alerta: conductor entró al radio del destino
    socket.on('geofence:entrada', (data) => {
      console.log('[WS] Geofence entrada:', data)
      // Puedes despachar una acción de notificación aquí
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Emitir eventos desde componentes 
  const emit = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }

  // Solicitar todas las posiciones GPS activas al conectar
  const solicitarPosiciones = () => emit('gps:solicitar_todas')

  // Conductor envía su posición
  const emitirGPS = ({ lat, lng, velocidad, ordenId, conductorId }) => {
    emit('gps:update', { lat, lng, velocidad, ordenId, conductorId })
  }

  // Conductor marca waypoint completado
  const completarWaypoint = ({ ordenId, waypointIndex }) => {
    emit('waypoint:completado', { ordenId, waypointIndex })
  }

  return (
    <SocketContext.Provider value={{ connected, emit, solicitarPosiciones, emitirGPS, completarWaypoint }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket debe usarse dentro de <SocketProvider>')
  return ctx
}