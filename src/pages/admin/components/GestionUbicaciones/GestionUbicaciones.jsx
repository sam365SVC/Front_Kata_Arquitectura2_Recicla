import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiMapPin, FiPlus, FiPackage, FiEdit2, FiX, FiCrosshair } from 'react-icons/fi'
import { fetchUbicaciones, crearUbicacion, actualizarCapacidad, actualizarUbicacion } from '../../../../store/thunks/ubicacionesThunks'
import styles from './GestionUbicaciones.module.scss'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Componente interno que escucha clics en el mapa para mover el marcador
const MapClickHandler = ({ onPositionChange }) => {
  useMapEvents({ click(e) { onPositionChange(e.latlng.lat, e.latlng.lng) } })
  return null
}

const FORM_VACIO = {
  nombre: '', tipo: 'kiosco', direccion: '', referencia: '',
  lat: -16.5, lng: -68.15, capacidadMaxima: '',
  horario: { apertura: '08:00', cierre: '18:00', diasAtencion: ['lunes','martes','miercoles','jueves','viernes'] },
  contacto: { nombre: '', telefono: '' },
  notas: '',
}

const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']

const UbicacionForm = ({ initial, onSubmit, onClose, title }) => {
  const [form, setForm] = useState(() => {
    if (!initial) return FORM_VACIO
    const [lng, lat] = initial.coordenadas?.coordinates || [-68.15, -16.5]
    return {
      nombre: initial.nombre || '',
      tipo: initial.tipo || 'kiosco',
      direccion: initial.direccion || '',
      referencia: initial.referencia || '',
      lat: lat || -16.5,
      lng: lng || -68.15,
      capacidadMaxima: initial.capacidadMaxima || '',
      horario: initial.horario || FORM_VACIO.horario,
      contacto: initial.contacto || { nombre: '', telefono: '' },
      notas: initial.notas || '',
    }
  })

  const setV = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setH = (key, val) => setForm(f => ({ ...f, horario: { ...f.horario, [key]: val } }))
  const setC = (key, val) => setForm(f => ({ ...f, contacto: { ...f.contacto, [key]: val } }))

  const handleMapClick = useCallback((lat, lng) => {
    setForm(f => ({ ...f, lat, lng }))
  }, [])

  const toggleDia = (dia) => {
    const dias = form.horario.diasAtencion.includes(dia)
      ? form.horario.diasAtencion.filter(d => d !== dia)
      : [...form.horario.diasAtencion, dia]
    setH('diasAtencion', dias)
  }

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form) }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modal__head}>
          <h3>{title}</h3>
          <button className={styles.modal__close} onClick={onClose}><FiX size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>

          <p className={styles.formSection}>Información general</p>
          <div className={styles.formGrid}>
            <label className={`${styles.label} ${styles['label--full']}`}>
              Nombre *
              <input className={styles.input} required value={form.nombre} onChange={e => setV('nombre', e.target.value)} placeholder="Ej: Kiosco Zona Sur" />
            </label>
            <label className={styles.label}>
              Tipo *
              <select className={styles.select} value={form.tipo} onChange={e => setV('tipo', e.target.value)}>
                <option value="kiosco">Kiosco de acopio</option>
                <option value="almacen_central">Almacén central</option>
              </select>
            </label>
            <label className={styles.label}>
              Capacidad máxima
              <input className={styles.input} type="number" min={0} value={form.capacidadMaxima} onChange={e => setV('capacidadMaxima', e.target.value)} placeholder="Nro. de equipos" />
            </label>
            <label className={`${styles.label} ${styles['label--full']}`}>
              Dirección
              <input className={styles.input} value={form.direccion} onChange={e => setV('direccion', e.target.value)} placeholder="Ej: Calle 21 de Calacoto, La Paz" />
            </label>
            <label className={`${styles.label} ${styles['label--full']}`}>
              Referencia
              <input className={styles.input} value={form.referencia} onChange={e => setV('referencia', e.target.value)} placeholder="Ej: Al lado del banco, frente al parque" />
            </label>
          </div>

          <p className={styles.formSection}>
            <FiCrosshair size={13} /> Ubicación en el mapa
            <span className={styles.formSection__hint}>Haz clic en el mapa para mover el marcador</span>
          </p>
          <div className={styles.mapPickerWrap}>
            <MapContainer center={[form.lat, form.lng]} zoom={13} style={{ width: '100%', height: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onPositionChange={handleMapClick} />
              <Marker position={[form.lat, form.lng]} />
            </MapContainer>
          </div>
          <div className={styles.coordsDisplay}>
            <span>Lat: <strong>{form.lat.toFixed(6)}</strong></span>
            <span>Lng: <strong>{form.lng.toFixed(6)}</strong></span>
          </div>

          <p className={styles.formSection}>Contacto</p>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Nombre contacto
              <input className={styles.input} value={form.contacto.nombre} onChange={e => setC('nombre', e.target.value)} />
            </label>
            <label className={styles.label}>
              Teléfono
              <input className={styles.input} value={form.contacto.telefono} onChange={e => setC('telefono', e.target.value)} />
            </label>
          </div>

          <p className={styles.formSection}>Horario de atención</p>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Apertura
              <input className={styles.input} type="time" value={form.horario.apertura} onChange={e => setH('apertura', e.target.value)} />
            </label>
            <label className={styles.label}>
              Cierre
              <input className={styles.input} type="time" value={form.horario.cierre} onChange={e => setH('cierre', e.target.value)} />
            </label>
            <div className={`${styles.label} ${styles['label--full']}`}>
              Días de atención
              <div className={styles.diasWrap}>
                {DIAS.map(d => (
                  <button type="button" key={d}
                    className={`${styles.diaPill} ${form.horario.diasAtencion.includes(d) ? styles['diaPill--on'] : ''}`}
                    onClick={() => toggleDia(d)}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.modal__actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary}>{title}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const OcupacionBar = ({ pct = 0 }) => {
  const color = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'success'
  return (
    <div className={styles.ocupacion}>
      <div className={styles.ocupacion__bar}>
        <div className={`${styles.ocupacion__fill} ${styles[`ocupacion__fill--${color}`]}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`${styles.ocupacion__pct} ${styles[`ocupacion__pct--${color}`]}`}>{pct}%</span>
    </div>
  )
}

const TIPO_LABEL = { kiosco: 'Kiosco', almacen_central: 'Almacén central' }

const GestionUbicaciones = () => {
  const dispatch = useDispatch()
  const { lista, loading } = useSelector(s => s.ubicaciones)

  const [showForm,    setShowForm]    = useState(false)
  const [editando,    setEditando]    = useState(null)
  const [editCap,     setEditCap]     = useState(null)
  const [capValue,    setCapValue]    = useState('')
  const [filtroTipo,  setFiltroTipo]  = useState('')

  useEffect(() => { dispatch(fetchUbicaciones()) }, [dispatch])

  const handleCrear = async (form) => {
    await dispatch(crearUbicacion(form))
    setShowForm(false)
  }

  const handleEditar = async (form) => {
    await dispatch(actualizarUbicacion({ id: editando._id, ...form }))
    setEditando(null)
  }

  const handleActualizarCap = async () => {
    if (!editCap) return
    await dispatch(actualizarCapacidad({ id: editCap.id, capacidadActual: parseInt(capValue) }))
    setEditCap(null); setCapValue('')
  }

  const filtrados = filtroTipo ? lista.filter(u => u.tipo === filtroTipo) : lista
  const kioscos  = lista.filter(u => u.tipo === 'kiosco')
  const almacenes = lista.filter(u => u.tipo === 'almacen_central')

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Ubicaciones</h1>
          <p>{kioscos.length} kioscos · {almacenes.length} almacén central</p>
        </div>
        <div className={styles.headerActions}>
          <select className={styles.select} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="kiosco">Kioscos</option>
            <option value="almacen_central">Almacén</option>
          </select>
          <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
            <FiPlus size={15} /> Nueva ubicación
          </button>
        </div>
      </header>

      {loading ? <p className={styles.loading}>Cargando...</p> : (
        <div className={styles.grid}>
          {filtrados.map(u => {
            const [lng, lat] = u.coordenadas?.coordinates || []
            const pct = u.capacidadMaxima > 0
              ? Math.round(((u.capacidadActual ?? 0) / u.capacidadMaxima) * 100)
              : (u.ocupacionPct ?? 0)
            return (
              <div key={u._id} className={`${styles.card} ${!u.activo ? styles['card--inactivo'] : ''}`}>
                <div className={styles.card__top}>
                  <div className={`${styles.card__typeIcon} ${u.tipo === 'almacen_central' ? styles['card__typeIcon--almacen'] : ''}`}>
                    {u.tipo === 'almacen_central' ? <FiPackage size={18} /> : <FiMapPin size={18} />}
                  </div>
                  <div className={styles.card__meta}>
                    <p className={styles.card__nombre}>{u.nombre}</p>
                    <span className={`${styles.tipeBadge} ${u.tipo === 'almacen_central' ? styles['tipeBadge--almacen'] : ''}`}>
                      {TIPO_LABEL[u.tipo]}
                    </span>
                  </div>
                  <button className={styles.card__editBtn} onClick={() => setEditando(u)} title="Editar">
                    <FiEdit2 size={13} />
                  </button>
                </div>

                {u.direccion  && <p className={styles.card__dir}>{u.direccion}</p>}
                {u.referencia && <p className={styles.card__ref}>{u.referencia}</p>}
                {lat && lng   && <p className={styles.card__coords}>{parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}</p>}

                {u.tipo === 'kiosco' && u.capacidadMaxima > 0 && (
                  <div className={styles.card__cap}>
                    <div className={styles.card__capRow}>
                      <span className={styles.card__capLabel}>Ocupación</span>
                      <span className={styles.card__capNums}>{u.capacidadActual ?? 0} / {u.capacidadMaxima}</span>
                    </div>
                    <OcupacionBar pct={pct} />
                  </div>
                )}

                {u.contacto?.nombre && (
                  <p className={styles.card__contacto}>{u.contacto.nombre} · {u.contacto.telefono}</p>
                )}

                {u.horario && (
                  <p className={styles.card__horario}>{u.horario.apertura} – {u.horario.cierre}</p>
                )}

                {u.tipo === 'kiosco' && u.activo && (
                  <button className={styles.btnCapacidad}
                    onClick={() => { setEditCap({ id: u._id, current: u.capacidadActual }); setCapValue(String(u.capacidadActual ?? 0)) }}>
                    <FiEdit2 size={12} /> Actualizar ocupación
                  </button>
                )}
              </div>
            )
          })}
          {filtrados.length === 0 && <p className={styles.empty}>Sin ubicaciones registradas</p>}
        </div>
      )}

      {showForm && (
        <UbicacionForm title="Nueva ubicación" onSubmit={handleCrear} onClose={() => setShowForm(false)} />
      )}

      {editando && (
        <UbicacionForm title="Editar ubicación" initial={editando} onSubmit={handleEditar} onClose={() => setEditando(null)} />
      )}

      {editCap && (
        <div className={styles.modalOverlay} onClick={() => setEditCap(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modal__head}>
              <h3>Actualizar ocupación</h3>
              <button className={styles.modal__close} onClick={() => setEditCap(null)}><FiX size={18} /></button>
            </div>
            <label className={styles.label}>
              Unidades actuales en el kiosco
              <input className={styles.input} type="number" min={0} value={capValue} onChange={e => setCapValue(e.target.value)} />
            </label>
            <div className={styles.modal__actions}>
              <button className={styles.btnSecondary} onClick={() => setEditCap(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleActualizarCap}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionUbicaciones