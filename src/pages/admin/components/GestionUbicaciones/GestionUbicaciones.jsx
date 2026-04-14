import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiMapPin, FiPlus, FiPackage, FiEdit2 } from 'react-icons/fi'
import { fetchUbicaciones, crearUbicacion, actualizarCapacidad } from '../../../../store/thunks/ubicacionesThunks'
import styles from './GestionUbicaciones.module.scss'

const OcupacionBar = ({ pct = 0 }) => {
  const color = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'success'
  return (
    <div className={styles.ocupacion}>
      <div className={styles.ocupacion__bar}>
        <div className={`${styles.ocupacion__fill} ${styles[`ocupacion__fill--${color}`]}`}
          style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`${styles.ocupacion__pct} ${styles[`ocupacion__pct--${color}`]}`}>{pct}%</span>
    </div>
  )
}

const TIPO_LABEL = { kiosco: 'Kiosco', almacen_central: 'Almacén central' }

const GestionUbicaciones = () => {
  const dispatch = useDispatch()
  const { lista, loading } = useSelector((s) => s.ubicaciones)

  const [showForm,  setShowForm]  = useState(false)
  const [editCap,   setEditCap]   = useState(null)   // { id, current }
  const [capValue,  setCapValue]  = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const [form, setForm] = useState({
    nombre: '', tipo: 'kiosco', direccion: '', referencia: '',
    lat: '', lng: '', capacidadMaxima: '',
    contacto: { nombre: '', telefono: '' },
  })

  useEffect(() => { dispatch(fetchUbicaciones()) }, [dispatch])

  const handleCrear = async (e) => {
    e.preventDefault()
    await dispatch(crearUbicacion(form))
    setShowForm(false)
    setForm({ nombre: '', tipo: 'kiosco', direccion: '', referencia: '', lat: '', lng: '', capacidadMaxima: '', contacto: { nombre: '', telefono: '' } })
  }

  const handleActualizarCap = async () => {
    if (!editCap) return
    await dispatch(actualizarCapacidad({ id: editCap.id, capacidadActual: parseInt(capValue) }))
    setEditCap(null); setCapValue('')
  }

  const kioscos = lista.filter((u) => u.tipo === 'kiosco')
  const almacenes = lista.filter((u) => u.tipo === 'almacen_central')
  const filtrados = filtroTipo ? lista.filter((u) => u.tipo === filtroTipo) : lista

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Ubicaciones</h1>
          <p>{kioscos.length} kioscos · {almacenes.length} almacén central</p>
        </div>
        <div className={styles.headerActions}>
          <select className={styles.select} value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}>
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
          {filtrados.map((u) => {
            const [lng, lat] = u.coordenadas?.coordinates || []
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
                  {!u.activo && <span className={styles.inactivoBadge}>Inactivo</span>}
                </div>

                {u.direccion && (
                  <p className={styles.card__dir}>{u.direccion}</p>
                )}

                {lat && lng && (
                  <p className={styles.card__coords}>{parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}</p>
                )}

                {u.tipo === 'kiosco' && u.capacidadMaxima > 0 && (
                  <div className={styles.card__cap}>
                    <div className={styles.card__capRow}>
                      <span className={styles.card__capLabel}>Ocupación</span>
                      <span className={styles.card__capNums}>
                        {u.capacidadActual ?? 0} / {u.capacidadMaxima}
                      </span>
                    </div>
                    <OcupacionBar pct={u.ocupacionPct ?? Math.round(((u.capacidadActual ?? 0) / u.capacidadMaxima) * 100)} />
                  </div>
                )}

                {u.contacto?.nombre && (
                  <p className={styles.card__contacto}>
                    {u.contacto.nombre} · {u.contacto.telefono}
                  </p>
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

      {/* Modal actualizar capacidad */}
      {editCap && (
        <div className={styles.modalOverlay} onClick={() => setEditCap(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Actualizar ocupación</h3>
            <label className={styles.label}>
              Unidades actuales en el kiosco
              <input className={styles.input} type="number" min={0} value={capValue}
                onChange={(e) => setCapValue(e.target.value)} />
            </label>
            <div className={styles.modal__actions}>
              <button className={styles.btnSecondary} onClick={() => setEditCap(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleActualizarCap}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear ubicación */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Nueva ubicación</h3>
            <form onSubmit={handleCrear}>
              <div className={styles.formGrid}>
                <label className={`${styles.label} ${styles['label--full']}`}>
                  Nombre *
                  <input className={styles.input} required value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </label>
                <label className={styles.label}>
                  Tipo
                  <select className={styles.select} value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                    <option value="kiosco">Kiosco</option>
                    <option value="almacen_central">Almacén central</option>
                  </select>
                </label>
                <label className={styles.label}>
                  Capacidad máxima
                  <input className={styles.input} type="number" min={0} value={form.capacidadMaxima}
                    onChange={(e) => setForm({ ...form, capacidadMaxima: e.target.value })} />
                </label>
                <label className={styles.label}>
                  Latitud *
                  <input className={styles.input} required type="number" step="any" value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })} />
                </label>
                <label className={styles.label}>
                  Longitud *
                  <input className={styles.input} required type="number" step="any" value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })} />
                </label>
                <label className={`${styles.label} ${styles['label--full']}`}>
                  Dirección
                  <input className={styles.input} value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
                </label>
                <label className={styles.label}>
                  Contacto nombre
                  <input className={styles.input} value={form.contacto.nombre}
                    onChange={(e) => setForm({ ...form, contacto: { ...form.contacto, nombre: e.target.value } })} />
                </label>
                <label className={styles.label}>
                  Contacto teléfono
                  <input className={styles.input} value={form.contacto.telefono}
                    onChange={(e) => setForm({ ...form, contacto: { ...form.contacto, telefono: e.target.value } })} />
                </label>
              </div>
              <div className={styles.modal__actions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionUbicaciones