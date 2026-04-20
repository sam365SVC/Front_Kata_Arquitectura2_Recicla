import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiUser, FiTruck, FiToggleLeft, FiToggleRight, FiPlus, FiEdit2, FiX } from 'react-icons/fi'
import { fetchConductores, toggleDisponibilidad, crearConductor, actualizarConductor } from '../../../../store/thunks/conductoresThunks'
import styles from './GestionConductores.module.scss'

const FORM_VACIO = {
  employeeId: '',
  nombreCache: '',
  vehiculo: { placa: '', tipo: 'camioneta', marca: '', modelo: '', color: '', capacidadKg: '' },
  zona: '',
  notas: '',
}

const ConductorForm = ({ initial, onSubmit, onClose, title }) => {
  const [form, setForm] = useState(initial || FORM_VACIO)

  const setV  = (key, val)       => setForm(f => ({ ...f, [key]: val }))
  const setVeh = (key, val)      => setForm(f => ({ ...f, vehiculo: { ...f.vehiculo, [key]: val } }))

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form) }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modal__head}>
          <h3>{title}</h3>
          <button className={styles.modal__close} onClick={onClose}><FiX size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className={styles.formSection}>Datos del empleado</p>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Employee ID *
              <input className={styles.input} required value={form.employeeId}
                onChange={e => setV('employeeId', e.target.value)}
                placeholder="ID en el MS de auth" />
            </label>
            <label className={styles.label}>
              Nombre completo *
              <input className={styles.input} required value={form.nombreCache}
                onChange={e => setV('nombreCache', e.target.value)}
                placeholder="Nombre para mostrar en el mapa" />
            </label>
            <label className={styles.label}>
              Zona de operación
              <input className={styles.input} value={form.zona}
                onChange={e => setV('zona', e.target.value)}
                placeholder="Ej: Zona Sur, Centro" />
            </label>
            <label className={`${styles.label} ${styles['label--full']}`}>
              Notas internas
              <textarea className={`${styles.input} ${styles.textarea}`} value={form.notas}
                onChange={e => setV('notas', e.target.value)}
                placeholder="Observaciones sobre el conductor" rows={2} />
            </label>
          </div>

          <p className={styles.formSection}>Datos del vehículo</p>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Placa *
              <input className={styles.input} required value={form.vehiculo.placa}
                onChange={e => setVeh('placa', e.target.value.toUpperCase())}
                placeholder="Ej: 2345-ABC" />
            </label>
            <label className={styles.label}>
              Tipo de vehículo *
              <select className={styles.select} value={form.vehiculo.tipo}
                onChange={e => setVeh('tipo', e.target.value)}>
                {['moto', 'camioneta', 'furgon', 'camion'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className={styles.label}>
              Marca
              <input className={styles.input} value={form.vehiculo.marca}
                onChange={e => setVeh('marca', e.target.value)}
                placeholder="Ej: Toyota" />
            </label>
            <label className={styles.label}>
              Modelo
              <input className={styles.input} value={form.vehiculo.modelo}
                onChange={e => setVeh('modelo', e.target.value)}
                placeholder="Ej: Hilux" />
            </label>
            <label className={styles.label}>
              Color
              <input className={styles.input} value={form.vehiculo.color}
                onChange={e => setVeh('color', e.target.value)}
                placeholder="Ej: Blanco" />
            </label>
            <label className={styles.label}>
              Capacidad (kg)
              <input className={styles.input} type="number" min={0} value={form.vehiculo.capacidadKg}
                onChange={e => setVeh('capacidadKg', e.target.value)}
                placeholder="Ej: 1000" />
            </label>
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

const GestionConductores = () => {
  const dispatch = useDispatch()
  const { lista, loading, posicionesGPS } = useSelector(s => ({ ...s.conductores, posicionesGPS: s.conductores.posicionesGPS }))

  const [showCrear, setShowCrear] = useState(false)
  const [editando,  setEditando]  = useState(null)   // conductor a editar

  useEffect(() => { dispatch(fetchConductores()) }, [dispatch])

  const handleToggle = c => dispatch(toggleDisponibilidad({ id: c._id, disponible: !c.disponible }))

  const handleCrear = async (form) => {
    await dispatch(crearConductor(form))
    setShowCrear(false)
  }

  const handleEditar = async (form) => {
    await dispatch(actualizarConductor({ id: editando._id, ...form }))
    setEditando(null)
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Conductores</h1>
          <p>{lista.filter(c => c.activo).length} activos · {lista.filter(c => c.disponible).length} disponibles</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowCrear(true)}>
          <FiPlus size={15} /> Registrar conductor
        </button>
      </header>

      {loading ? <p className={styles.loading}>Cargando...</p> : (
        <div className={styles.grid}>
          {lista.map(c => {
            const gps = posicionesGPS[c._id]
            return (
              <div key={c._id} className={`${styles.card} ${!c.activo ? styles['card--inactivo'] : ''}`}>
                <div className={styles.card__header}>
                  <div className={styles.card__avatar}>{c.nombreCache?.[0]?.toUpperCase() || '?'}</div>
                  <div className={styles.card__info}>
                    <p className={styles.card__nombre}>{c.nombreCache || '—'}</p>
                    <p className={styles.card__sub}>ID: {c.employeeId}</p>
                  </div>
                  <div className={styles.card__badges}>
                    <div className={`${styles.card__gps} ${gps?.online ? styles['card__gps--on'] : ''}`}>
                      {gps?.online ? 'En línea' : 'Offline'}
                    </div>
                    <button className={styles.card__editBtn} onClick={() => setEditando(c)} title="Editar conductor">
                      <FiEdit2 size={13} />
                    </button>
                  </div>
                </div>

                <div className={styles.card__vehiculo}>
                  <FiTruck size={13} />
                  <span>{c.vehiculo?.placa} · {c.vehiculo?.tipo} · {c.vehiculo?.marca} {c.vehiculo?.modelo}</span>
                </div>

                {c.vehiculo?.color && (
                  <div className={styles.card__detail}>Color: {c.vehiculo.color} · {c.vehiculo.capacidadKg ? `${c.vehiculo.capacidadKg} kg` : '—'}</div>
                )}

                {c.zona && <p className={styles.card__zona}>Zona: {c.zona}</p>}

                {gps?.online && (
                  <div className={styles.card__coords}>
                    {gps.lat?.toFixed(5)}, {gps.lng?.toFixed(5)} · {gps.velocidad} km/h
                  </div>
                )}

                {c.notas && <p className={styles.card__notas}>{c.notas}</p>}

                <div className={styles.card__footer}>
                  <button
                    className={`${styles.toggleBtn} ${c.disponible ? styles['toggleBtn--on'] : ''}`}
                    onClick={() => handleToggle(c)} disabled={!c.activo}>
                    {c.disponible ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                    {c.disponible ? 'Disponible' : 'No disponible'}
                  </button>
                </div>
              </div>
            )
          })}
          {lista.length === 0 && <p className={styles.empty}>No hay conductores registrados</p>}
        </div>
      )}

      {showCrear && (
        <ConductorForm title="Registrar conductor" onSubmit={handleCrear} onClose={() => setShowCrear(false)} />
      )}

      {editando && (
        <ConductorForm title="Editar conductor" initial={editando} onSubmit={handleEditar} onClose={() => setEditando(null)} />
      )}
    </div>
  )
}

export default GestionConductores