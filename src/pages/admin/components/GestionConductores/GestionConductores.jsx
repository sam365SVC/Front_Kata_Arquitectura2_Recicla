import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiUser, FiTruck, FiToggleLeft, FiToggleRight, FiPlus } from 'react-icons/fi'
import { fetchConductores, toggleDisponibilidad, crearConductor } from '../../../../store/thunks/conductoresThunks'
import styles from './GestionConductores.module.scss'

const GestionConductores = () => {
  const dispatch = useDispatch()
  const { lista, loading, posicionesGPS } = useSelector((s) => ({
    ...s.conductores, posicionesGPS: s.conductores.posicionesGPS,
  }))

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    employeeId: '', nombreCache: '',
    vehiculo: { placa: '', tipo: 'camioneta', marca: '', capacidadKg: '' },
    zona: '',
  })

  useEffect(() => { dispatch(fetchConductores()) }, [dispatch])

  const handleToggle = (c) => {
    dispatch(toggleDisponibilidad({ id: c._id, disponible: !c.disponible }))
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    await dispatch(crearConductor(form))
    setShowForm(false)
    setForm({ employeeId: '', nombreCache: '', vehiculo: { placa: '', tipo: 'camioneta', marca: '', capacidadKg: '' }, zona: '' })
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Conductores</h1>
          <p>{lista.filter((c) => c.activo).length} activos · {lista.filter((c) => c.disponible).length} disponibles</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
          <FiPlus size={15} /> Registrar conductor
        </button>
      </header>

      {loading ? <p className={styles.loading}>Cargando...</p> : (
        <div className={styles.grid}>
          {lista.map((c) => {
            const gps = posicionesGPS[c._id]
            return (
              <div key={c._id} className={`${styles.card} ${!c.activo ? styles['card--inactivo'] : ''}`}>
                <div className={styles.card__header}>
                  <div className={styles.card__avatar}>{c.nombreCache?.[0] || '?'}</div>
                  <div className={styles.card__info}>
                    <p className={styles.card__nombre}>{c.nombreCache || '—'}</p>
                    <p className={styles.card__sub}>ID: {c.employeeId}</p>
                  </div>
                  <div className={`${styles.card__gps} ${gps?.online ? styles['card__gps--on'] : ''}`}>
                    {gps?.online ? 'En línea' : 'Offline'}
                  </div>
                </div>

                <div className={styles.card__vehiculo}>
                  <FiTruck size={13} />
                  <span>{c.vehiculo?.placa} · {c.vehiculo?.tipo} · {c.vehiculo?.capacidadKg}kg</span>
                </div>

                {c.zona && <p className={styles.card__zona}>Zona: {c.zona}</p>}

                {gps?.online && (
                  <div className={styles.card__coords}>
                    {gps.lat?.toFixed(5)}, {gps.lng?.toFixed(5)} · {gps.velocidad} km/h
                  </div>
                )}

                <div className={styles.card__footer}>
                  <button
                    className={`${styles.toggleBtn} ${c.disponible ? styles['toggleBtn--on'] : ''}`}
                    onClick={() => handleToggle(c)}
                    disabled={!c.activo}
                  >
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

      {/* Modal crear conductor */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Registrar conductor</h3>
            <form onSubmit={handleCrear}>
              <div className={styles.formGrid}>
                <label className={styles.label}>
                  Employee ID *
                  <input className={styles.input} required value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
                </label>
                <label className={styles.label}>
                  Nombre 
                  <input className={styles.input} value={form.nombreCache}
                    onChange={(e) => setForm({ ...form, nombreCache: e.target.value })} />
                </label>
                <label className={styles.label}>
                  Placa *
                  <input className={styles.input} required value={form.vehiculo.placa}
                    onChange={(e) => setForm({ ...form, vehiculo: { ...form.vehiculo, placa: e.target.value } })} />
                </label>
                <label className={styles.label}>
                  Tipo vehículo
                  <select className={styles.select} value={form.vehiculo.tipo}
                    onChange={(e) => setForm({ ...form, vehiculo: { ...form.vehiculo, tipo: e.target.value } })}>
                    {['moto', 'camioneta', 'furgon', 'camion'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className={styles.label}>
                  Zona
                  <input className={styles.input} value={form.zona}
                    onChange={(e) => setForm({ ...form, zona: e.target.value })} />
                </label>
              </div>
              <div className={styles.modal__actions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionConductores