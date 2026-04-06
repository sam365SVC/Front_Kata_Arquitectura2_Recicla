import React, { useState, useCallback } from "react";
import {
  FiX, FiUser, FiCpu, FiClipboard, FiCheckCircle,
  FiAlertTriangle, FiCamera, FiTrash2, FiInfo,
  FiArrowLeft, FiSend, FiChevronRight,
} from "react-icons/fi";
import { MdOutlineDevices, MdOutlineSmartphone, MdOutlineLaptop, MdOutlineWatch, MdOutlineDesktopWindows, MdOutlineTablet } from "react-icons/md";
import styles from "./CreateSolicitudModal.module.scss";
import {
  TIPOS_DISPOSITIVO, CLIENTE_ACTUAL,
  MONTO_BASE, AJUSTE_CONDICION,
  solicitudesApi,
} from "../mock/data";

// Pasos
const PASOS = [
  { id: 1, label: "Cliente",   icon: FiUser      },
  { id: 2, label: "Equipo",    icon: FiCpu       },
  { id: 3, label: "Preliminar",icon: FiClipboard },
  { id: 4, label: "Confirmar", icon: FiCheckCircle },
];

const CONDICIONES_OPTS = [
  { key: "excelente", label: "Excelente", sub: "Sin marcas ni daños",    icon: FiCheckCircle, color: "#1A7A56" },
  { key: "bueno",     label: "Bueno",     sub: "Uso normal, sin daños",  icon: FiCheckCircle, color: "#79864B" },
  { key: "regular",   label: "Regular",   sub: "Detalles leves de uso",  icon: FiAlertTriangle, color: "#C45E00" },
  { key: "malo",      label: "Malo",      sub: "Daños visibles",         icon: FiAlertTriangle, color: "#B82020" },
];

const TIPO_ICONOS = {
    tdv001: MdOutlineLaptop,
    tdv002: MdOutlineSmartphone,
    tdv003: MdOutlineTablet,
    tdv004: MdOutlineDesktopWindows,
    tdv005: MdOutlineWatch,
};

// Validaciones
const validar1 = (d) => {
    const e = {};
    if (!d.nombre.trim())   e.nombre   = "El nombre es obligatorio";
    if (!d.email.trim())    e.email    = "El email es obligatorio";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(d.email)) e.email = "Email inválido";
    if (!d.telefono.trim()) e.telefono = "El teléfono es obligatorio";
    return e;
};

const validar2 = (d) => {
    const e = {};
    if (!d.tipoDispositivoId)  e.tipoDispositivoId  = "Selecciona el tipo de dispositivo";
    if (!d.marca.trim())        e.marca              = "La marca es obligatoria";
    if (!d.modelo.trim())       e.modelo             = "El modelo es obligatorio";
    if (d.antiguedad === "" || d.antiguedad === null || d.antiguedad === undefined)
        e.antiguedad = "La antigüedad es obligatoria";
    if (Number(d.antiguedad) < 0) e.antiguedad = "No puede ser negativa";
    if (!d.condicionDeclarada)  e.condicionDeclarada = "Selecciona la condición del equipo";
    return e;
};

// Paso 1: Cliente 
const Paso1 = ({ data, onChange, errors }) => (
    <div className={styles.stepContent}>
        <div className={styles.tip}>
        <FiInfo size={15} />
        <span>Revisa y ajusta tus datos de contacto si es necesario.</span>
        </div>

        <div className={`${styles.formGroup} ${errors.nombre ? styles["formGroup--error"] : ""}`}>
        <label className={styles.formGroup__label}>
            <FiUser size={13} /> Nombre completo
            <span className={styles.formGroup__req}> *</span>
        </label>
        <input
            type="text"
            placeholder="Ej: María García López"
            value={data.nombre}
            onChange={(e) => onChange("nombre", e.target.value)}
        />
        {errors.nombre && (
            <span className={styles.formGroup__errMsg}><FiAlertTriangle size={12}/> {errors.nombre}</span>
        )}
        </div>

        <div className={styles.formRow}>
        <div className={`${styles.formGroup} ${errors.email ? styles["formGroup--error"] : ""}`}>
            <label className={styles.formGroup__label}>
            Correo electrónico<span className={styles.formGroup__req}> *</span>
            </label>
            <input
            type="email"
            placeholder="tu@email.com"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            />
            {errors.email && (
            <span className={styles.formGroup__errMsg}><FiAlertTriangle size={12}/> {errors.email}</span>
            )}
        </div>

        <div className={`${styles.formGroup} ${errors.telefono ? styles["formGroup--error"] : ""}`}>
            <label className={styles.formGroup__label}>
            Teléfono<span className={styles.formGroup__req}> *</span>
            </label>
            <input
            type="tel"
            placeholder="+591 7XXXXXXX"
            value={data.telefono}
            onChange={(e) => onChange("telefono", e.target.value)}
            />
            {errors.telefono && (
            <span className={styles.formGroup__errMsg}><FiAlertTriangle size={12}/> {errors.telefono}</span>
            )}
        </div>
        </div>
    </div>
);

// Paso 2: Equipo
const Paso2 = ({ data, onChange, errors }) => {
  const [fotos, setFotos] = useState(data.fotosSimuladas || []);

  const addFoto = () => {
    const nuevas = [...fotos, `foto_${Date.now()}.jpg`];
    setFotos(nuevas);
    onChange("fotosSimuladas", nuevas);
  };

  const removeFoto = (idx) => {
    const nuevas = fotos.filter((_, i) => i !== idx);
    setFotos(nuevas);
    onChange("fotosSimuladas", nuevas);
  };

  return (
    <div className={styles.stepContent}>
        {/* Tipo dispositivo */}
        <div className={`${styles.formGroup} ${errors.tipoDispositivoId ? styles["formGroup--error"] : ""}`}>
            <label className={styles.formGroup__label}>
            <MdOutlineDevices size={14} />
            Tipo de dispositivo<span className={styles.formGroup__req}> *</span>
            </label>
            <select
            value={data.tipoDispositivoId}
            onChange={(e) => onChange("tipoDispositivoId", e.target.value)}
            >
            <option value="">— Selecciona el tipo —</option>
            {TIPOS_DISPOSITIVO.map((t) => (
                <option key={t._id} value={t._id}>{t.nombre}</option>
            ))}
            </select>
            {errors.tipoDispositivoId && (
            <span className={styles.formGroup__errMsg}><FiAlertTriangle size={12}/> {errors.tipoDispositivoId}</span>
            )}
        </div>

        <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${errors.marca ? styles["formGroup--error"] : ""}`}>
            <label className={styles.formGroup__label}>
                Marca<span className={styles.formGroup__req}> *</span>
            </label>
            <input
                type="text"
                placeholder="Ej: Apple, Samsung"
                value={data.marca}
                onChange={(e) => onChange("marca", e.target.value)}
            />
            {errors.marca && (
                <span className={styles.formGroup__errMsg}><FiAlertTriangle size={12}/> {errors.marca}</span>
            )}
            </div>

            <div className={`${styles.formGroup} ${errors.modelo ? styles["formGroup--error"] : ""}`}>
            <label className={styles.formGroup__label}>
                Modelo<span className={styles.formGroup__req}> *</span>
            </label>
            <input
                type="text"
                placeholder="Ej: iPhone 14 Pro"
                value={data.modelo}
                onChange={(e) => onChange("modelo", e.target.value)}
            />
            {errors.modelo && (
                <span className={styles.formGroup__errMsg}><FiAlertTriangle size={12}/> {errors.modelo}</span>
            )}
            </div>
        </div>

        <div className={`${styles.formGroup} ${errors.antiguedad ? styles["formGroup--error"] : ""}`}>
            <label className={styles.formGroup__label}>
            Antigüedad (años)<span className={styles.formGroup__req}> *</span>
            </label>
            <input
            type="number"
            min="0"
            max="20"
            placeholder="Ej: 2"
            value={data.antiguedad === "" ? "" : data.antiguedad}
            onChange={(e) => onChange("antiguedad", e.target.value === "" ? "" : Number(e.target.value))}
            />
            {errors.antiguedad && (
            <span className={styles.formGroup__errMsg}><FiAlertTriangle size={12}/> {errors.antiguedad}</span>
            )}
        </div>

        {/* Condición */}
        <div className={`${styles.formGroup} ${errors.condicionDeclarada ? styles["formGroup--error"] : ""}`}>
            <label className={styles.formGroup__label}>
            Estado del equipo<span className={styles.formGroup__req}> *</span>
            </label>
            <div className={styles.condGrid}>
            {CONDICIONES_OPTS.map((c) => {
                const Icon = c.icon;
                const sel = data.condicionDeclarada === c.key;
                return (
                <div
                    key={c.key}
                    className={`${styles.condCard} ${sel ? styles["condCard--selected"] : ""}`}
                    onClick={() => onChange("condicionDeclarada", c.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onChange("condicionDeclarada", c.key)}
                >
                    <Icon
                    size={22}
                    className={styles.condCard__icon}
                    style={{ color: sel ? c.color : undefined }}
                    />
                    <span className={styles.condCard__label}>{c.label}</span>
                    <span className={styles.condCard__sub}>{c.sub}</span>
                </div>
                );
            })}
            </div>
            {errors.condicionDeclarada && (
            <span className={styles.formGroup__errMsg} style={{ marginTop: 8 }}>
                <FiAlertTriangle size={12}/> {errors.condicionDeclarada}
            </span>
            )}
        </div>

        {/* Descripción */}
        <div className={styles.formGroup}>
            <label className={styles.formGroup__label}>Descripción</label>
            <textarea
            placeholder="Describe el estado del equipo, accesorios incluidos, daños si los hay..."
            value={data.descripcion}
            onChange={(e) => onChange("descripcion", e.target.value)}
            />
        </div>

        {/* Fotos */}
        <div className={styles.formGroup}>
            <label className={styles.formGroup__label}>
            <FiCamera size={13} /> Fotos del equipo (opcional)
            </label>
            <div className={styles.photoUploader} onClick={addFoto} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && addFoto()}>
            <FiCamera size={28} className={styles.photoUploader__icon} />
            <span className={styles.photoUploader__text}>Haz clic para agregar fotos</span>
            <span className={styles.photoUploader__hint}>PNG, JPG, HEIC · Máx 5 MB (simulado)</span>
            </div>
            {fotos.length > 0 && (
            <div className={styles.photoList}>
                {fotos.map((f, i) => (
                <div key={i} className={styles.photoList__item}>
                    <FiCamera size={12} />
                    {f}
                    <button onClick={() => removeFoto(i)} aria-label="Eliminar foto">
                    <FiTrash2 size={12} />
                    </button>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
};

// Paso 3: Revisión preliminar 
const Paso3 = ({ clienteData, equipoData }) => {
  const base     = MONTO_BASE[equipoData.tipoDispositivoId] || 2000;
  const adjCond  = AJUSTE_CONDICION[equipoData.condicionDeclarada] || 0;
  const adjAntig = -(Number(equipoData.antiguedad || 0) * 180);
  const total    = Math.max(0, base + adjCond + adjAntig);
  const tipo     = TIPOS_DISPOSITIVO.find((t) => t._id === equipoData.tipoDispositivoId);

  return (
    <div className={styles.stepContent}>
      <div className={styles.tip}>
        <FiInfo size={15} />
        <span>
          Monto <strong>estimado</strong> — el valor final se confirma tras la inspección física.
        </span>
      </div>

      <div className={styles.previewEquipo}>
        <h4>Resumen del equipo</h4>
        {[
          ["Tipo",       tipo?.nombre || "—"],
          ["Marca",      equipoData.marca],
          ["Modelo",     equipoData.modelo],
          ["Antigüedad", `${equipoData.antiguedad} año${equipoData.antiguedad !== 1 ? "s" : ""}`],
          ["Condición",  equipoData.condicionDeclarada],
        ].map(([k, v]) => (
          <div key={k} className={styles.previewEquipo__row}>
            <span>{k}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      <div className={styles.previewCard}>
        <div className={styles.previewCard__monto}>
          <p>Monto preliminar estimado</p>
          <big>Bs. {total.toLocaleString("es-BO")}</big>
          <span>bolivianos</span>
        </div>

        {[
          { desc: `Valor base para ${tipo?.nombre || "dispositivo"}`,             val: base,     isBase: true  },
          { desc: `Descuento por ${equipoData.antiguedad} año(s) de uso`,          val: adjAntig, isBase: false },
          { desc: `Ajuste por condición ${equipoData.condicionDeclarada || "—"}`,  val: adjCond,  isBase: false },
        ].map((r, i) => (
          <div key={i} className={styles.previewCard__regla}>
            <span>{r.desc}</span>
            <strong style={{ color: r.isBase ? "#0E2A46" : r.val >= 0 ? "#1A7A56" : "#FC6441" }}>
              {r.isBase ? "" : r.val >= 0 ? "+" : "−"} Bs. {Math.abs(r.val).toLocaleString("es-BO")}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

// Paso 4: Confirmación 
const Paso4 = ({ clienteData, equipoData }) => {
  const tipo = TIPOS_DISPOSITIVO.find((t) => t._id === equipoData.tipoDispositivoId);
  return (
    <div className={styles.stepContent}>
      <div className={styles.confirmStep}>
        <div className={styles.confirmStep__icon}>
          <FiSend size={32} />
        </div>
        <h3 className={styles.confirmStep__title}>¡Todo listo!</h3>
        <p className={styles.confirmStep__text}>
          Enviaremos tu solicitud y en minutos recibirás una oferta preliminar para revisar.
        </p>

        <div className={styles.confirmStep__summary}>
          <h4>Resumen final</h4>
          {[
            ["Cliente",    clienteData.nombre],
            ["Equipo",     `${equipoData.marca} ${equipoData.modelo}`],
            ["Tipo",       tipo?.nombre || "—"],
            ["Condición",  equipoData.condicionDeclarada || "—"],
            ["Canal",      "Web"],
          ].map(([k, v]) => (
            <div key={k} className={styles.confirmStep__summary_row}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modal principal 
const CreateSolicitudModal = ({ onClose, onSuccess }) => {
    const [paso,    setPaso]    = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors,  setErrors]  = useState({});

    const [clienteData, setClienteData] = useState({ ...CLIENTE_ACTUAL });
    const [equipoData,  setEquipoData]  = useState({
        tipoDispositivoId:  "",
        marca:              "",
        modelo:             "",
        antiguedad:         "",
        condicionDeclarada: "",
        descripcion:        "",
        fotosSimuladas:     [],
    });

    const handleClienteChange = useCallback((field, value) => {
        setClienteData((p) => ({ ...p, [field]: value }));
        setErrors((p) => { const c = { ...p }; delete c[field]; return c; });
    }, []);

    const handleEquipoChange = useCallback((field, value) => {
        setEquipoData((p) => ({ ...p, [field]: value }));
        setErrors((p) => { const c = { ...p }; delete c[field]; return c; });
    }, []);

    const avanzar = async () => {
        if (paso === 1) {
        const errs = validar1(clienteData);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        }
        if (paso === 2) {
        const errs = validar2(equipoData);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        }
        if (paso === 4) {
        await enviar();
        return;
        }
        setErrors({});
        setPaso((p) => p + 1);
    };

    const retroceder = () => {
        if (paso === 1) { onClose(); return; }
        setPaso((p) => p - 1);
        setErrors({});
    };

    const enviar = async () => {
        setLoading(true);
        try {
        const tipo = TIPOS_DISPOSITIVO.find((t) => t._id === equipoData.tipoDispositivoId);
        const payload = {
            tenantId:          1,
            tipoDispositivoId: tipo || { _id: equipoData.tipoDispositivoId, nombre: "Dispositivo" },
            cliente: {
            nombre:   clienteData.nombre,
            email:    clienteData.email,
            telefono: clienteData.telefono,
            },
            canal:      "web",
            datosEquipo: {
            marca:             equipoData.marca,
            modelo:            equipoData.modelo,
            antiguedad:        Number(equipoData.antiguedad),
            condicionDeclarada: equipoData.condicionDeclarada,
            descripcion:       equipoData.descripcion,
            fotos:             equipoData.fotosSimuladas,
            },
            moneda: "BOB",
        };
        const res = await solicitudesApi.create(payload);
        if (res.ok) onSuccess(res.data);
        } finally {
        setLoading(false);
        }
    };

    const renderPaso = () => {
        switch (paso) {
        case 1: return <Paso1 data={clienteData} onChange={handleClienteChange} errors={errors} />;
        case 2: return <Paso2 data={equipoData}  onChange={handleEquipoChange}  errors={errors} />;
        case 3: return <Paso3 clienteData={clienteData} equipoData={equipoData} />;
        case 4: return <Paso4 clienteData={clienteData} equipoData={equipoData} />;
        default: return null;
        }
    };

    return (
        <div
        className={styles.overlay}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        >
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Nueva solicitud">

            {/* Header */}
            <div className={styles.header}>
            <h2 className={styles.header__title}>
                <FiClipboard size={20} />
                Nueva solicitud
            </h2>
            <p className={styles.header__sub}>
                Completa los pasos para enviar tu dispositivo a valoración
            </p>
            <button className={styles.header__close} onClick={onClose} aria-label="Cerrar">
                <FiX />
            </button>
            </div>

            {/* Stepper */}
            <div className={styles.stepper}>
            {PASOS.map((p, idx) => {
                const estado = paso > p.id ? "done" : paso === p.id ? "active" : "pending";
                const Icon   = p.icon;
                return (
                <React.Fragment key={p.id}>
                    {idx > 0 && (
                    <div
                        className={`${styles.stepper__connector} ${
                        paso > p.id
                            ? styles["stepper__connector--done"]
                            : paso === p.id
                            ? styles["stepper__connector--active"]
                            : ""
                        }`}
                    />
                    )}
                    <div className={styles.stepper__step}>
                    <div
                        className={`${styles.stepper__circle} ${
                        estado === "active"
                            ? styles["stepper__circle--active"]
                            : estado === "done"
                            ? styles["stepper__circle--done"]
                            : ""
                        }`}
                    >
                        {estado === "done" ? <FiCheckCircle size={14} /> : <Icon size={14} />}
                    </div>
                    <span
                        className={`${styles.stepper__label} ${
                        estado === "active"
                            ? styles["stepper__label--active"]
                            : estado === "done"
                            ? styles["stepper__label--done"]
                            : ""
                        }`}
                    >
                        {p.label}
                    </span>
                    </div>
                </React.Fragment>
                );
            })}
            </div>

            {/* Body */}
            <div className={styles.body}>{renderPaso()}</div>

            {/* Footer */}
            <div className={styles.footer}>
            <button
                className={styles.footer__back}
                onClick={retroceder}
                disabled={loading}
            >
                <FiArrowLeft size={15} />
                {paso === 1 ? "Cancelar" : "Atrás"}
            </button>

            <button
                className={styles.footer__next}
                onClick={avanzar}
                disabled={loading}
            >
                {loading ? (
                <span className={styles.footer__spinner} />
                ) : paso === 4 ? (
                <>
                    <FiSend size={15} />
                    Enviar solicitud
                </>
                ) : (
                <>
                    Continuar
                    <FiChevronRight size={15} />
                </>
                )}
            </button>
            </div>
        </div>
        </div>
    );
}; export default CreateSolicitudModal;