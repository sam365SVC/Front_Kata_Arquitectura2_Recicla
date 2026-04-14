import React, { useState, useCallback, useEffect, useRef} from "react";
import {
  FiX, FiUser, FiCpu, FiClipboard, FiCheckCircle,
  FiAlertTriangle, FiCamera, FiTrash2, FiInfo,
  FiArrowLeft, FiSend, FiChevronRight, FiZoomIn,
  FiPlus
} from "react-icons/fi";
import { MdOutlineDevices, MdOutlineSmartphone, MdOutlineLaptop, MdOutlineWatch, MdOutlineDesktopWindows, MdOutlineTablet } from "react-icons/md";

// para consumo inicial
//sin tokens, solo para mostrar la info de la cotización y probar la UI
import { useDispatch, useSelector } from 'react-redux';

import { clearError, selectTiposDispositivo } from "../slicesTiposDispositivo/TiposDispositivoSlice";
import { fetchTiposDispositivo} from "../slicesTiposDispositivo/TiposDispositivoThunk";

// para crear la cotizacion

import { crearSolicitudCotizacion } from "../slicesCotizaciones/CotizacionesThunk";
import { selectCotizacionesState, selectCotizacionesCreating, selectCotizacionesError} from "../slicesCotizaciones/CotizacionesSlice";


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
    if (!d.id.trim())       e.id       = "El id es obligatorio";
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

const comparar = (valorDocumento, operador, valorRegla) => {
  switch (operador) {
    case "=":
      return valorDocumento === valorRegla;
    case "!=":
      return valorDocumento !== valorRegla;
    case ">":
      return Number(valorDocumento) > Number(valorRegla);
    case "<":
      return Number(valorDocumento) < Number(valorRegla);
    case ">=":
      return Number(valorDocumento) >= Number(valorRegla);
    case "<=":
      return Number(valorDocumento) <= Number(valorRegla);
    default:
      return false;
  }
};

const calcularPreview = (tipo, equipoData) => {
  if (!tipo) {
    return {
      total: 0,
      base: 0,
      reglas: [],
    };
  }

  let total = Number(tipo.precioBase || 0);
  const reglas = [];

  for (const regla of tipo.reglasCotizacion || []) {
    const valorCampo = equipoData[regla.campo];

    if (comparar(valorCampo, regla.operador, regla.valor)) {
      total += Number(regla.ajusteMonto || 0);
      reglas.push({
        desc: regla.descripcion || regla.codigo,
        val: Number(regla.ajusteMonto || 0),
      });
    }
  }

  if (total < 0) total = 0;

  return {
    total,
    base: Number(tipo.precioBase || 0),
    reglas,
  };
};

const subirImagenesSolicitud = async (archivos) => {
  if (!archivos || archivos.length === 0) return [];

  const formData = new FormData();

  archivos.forEach((file) => {
    formData.append("imagenes", file);
  });

  const response = await fetch("http://localhost:4001/api/core/upload/solicitudes", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "Error al subir imágenes");
  }

  return result.data || [];
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

// ─── Reemplaza solo la sección de fotos dentro de Paso2 ───────────────────────
// El resto del componente (formGroups, condGrid, etc.) permanece igual.
// Agrega este import al inicio del archivo si no lo tienes:


const MAX_FOTOS = 5;

const Paso2 = ({ data, onChange, errors, tiposDispositivo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [lightbox, setLightbox]     = useState(null); // URL de la foto ampliada
  const inputRef = useRef(null);

  // ── Helpers de archivo ────────────────────────────────────────────────────
  const agregarArchivos = useCallback(
    (files) => {
      const archivosActuales = data.archivos  || [];
      const previewsActuales = data.previews  || [];
      const libres           = MAX_FOTOS - archivosActuales.length;
      if (libres <= 0) return;

      const nuevos = Array.from(files).slice(0, libres);

      onChange("archivos", [...archivosActuales, ...nuevos]);
      onChange("previews", [
        ...previewsActuales,
        ...nuevos.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
      ]);
    },
    [data.archivos, data.previews, onChange]
  );

  const removeFoto = (idx) => {
    onChange("archivos", (data.archivos || []).filter((_, i) => i !== idx));
    onChange("previews", (data.previews || []).filter((_, i) => i !== idx));
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true);  };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    agregarArchivos(e.dataTransfer.files);
  };

  const total   = (data.previews || []).length;
  const isFull  = total >= MAX_FOTOS;

  return (
    <div className={styles.stepContent}>

      {/* ── Tipo de dispositivo ── */}
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
          {tiposDispositivo.map((t) => (
            <option key={t._id} value={t._id}>{t.nombre}</option>
          ))}
        </select>
        {errors.tipoDispositivoId && (
          <span className={styles.formGroup__errMsg}>
            <FiAlertTriangle size={12} /> {errors.tipoDispositivoId}
          </span>
        )}
      </div>

      {/* ── Marca / Modelo ── */}
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
            <span className={styles.formGroup__errMsg}>
              <FiAlertTriangle size={12} /> {errors.marca}
            </span>
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
            <span className={styles.formGroup__errMsg}>
              <FiAlertTriangle size={12} /> {errors.modelo}
            </span>
          )}
        </div>
      </div>

      {/* ── Antigüedad ── */}
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
          onChange={(e) =>
            onChange("antiguedad", e.target.value === "" ? "" : Number(e.target.value))
          }
        />
        {errors.antiguedad && (
          <span className={styles.formGroup__errMsg}>
            <FiAlertTriangle size={12} /> {errors.antiguedad}
          </span>
        )}
      </div>

      {/* ── Condición ── */}
      <div className={`${styles.formGroup} ${errors.condicionDeclarada ? styles["formGroup--error"] : ""}`}>
        <label className={styles.formGroup__label}>
          Estado del equipo<span className={styles.formGroup__req}> *</span>
        </label>
        <div className={styles.condGrid}>
          {CONDICIONES_OPTS.map((c) => {
            const Icon = c.icon;
            const sel  = data.condicionDeclarada === c.key;
            return (
              <div
                key={c.key}
                className={`${styles.condCard} ${sel ? styles["condCard--selected"] : ""}`}
                onClick={() => onChange("condicionDeclarada", c.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onChange("condicionDeclarada", c.key)}
              >
                <Icon size={22} className={styles.condCard__icon} style={{ color: sel ? c.color : undefined }} />
                <span className={styles.condCard__label}>{c.label}</span>
                <span className={styles.condCard__sub}>{c.sub}</span>
              </div>
            );
          })}
        </div>
        {errors.condicionDeclarada && (
          <span className={styles.formGroup__errMsg} style={{ marginTop: 8 }}>
            <FiAlertTriangle size={12} /> {errors.condicionDeclarada}
          </span>
        )}
      </div>

      {/* ── Descripción ── */}
      <div className={styles.formGroup}>
        <label className={styles.formGroup__label}>Descripción</label>
        <textarea
          placeholder="Describe el estado del equipo, accesorios incluidos, daños si los hay..."
          value={data.descripcion}
          onChange={(e) => onChange("descripcion", e.target.value)}
        />
      </div>

      {/* ════════════════════════════════════════
          FOTOS DEL EQUIPO — sección rediseñada
          ════════════════════════════════════════ */}
      <div className={styles.formGroup}>
        <div className={styles.photoLabel}>
          <label className={styles.formGroup__label}>
            <FiCamera size={13} /> Fotos del equipo
            <span className={styles.photoLabel__optional}> (opcional)</span>
          </label>
          <span className={`${styles.photoLabel__counter} ${isFull ? styles["photoLabel__counter--full"] : ""}`}>
            {total} / {MAX_FOTOS}
          </span>
        </div>

        {/* Zona de drop */}
        {!isFull && (
          <div
            className={`${styles.dropZone} ${isDragging ? styles["dropZone--dragging"] : ""}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            aria-label="Subir fotos"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              hidden
              onChange={(e) => agregarArchivos(e.target.files)}
            />
            <div className={styles.dropZone__inner}>
              <div className={styles.dropZone__iconWrap}>
                <FiCamera size={24} className={styles.dropZone__icon} />
              </div>
              <p className={styles.dropZone__title}>
                {isDragging ? "Suelta las fotos aquí" : "Arrastra fotos o haz clic para seleccionar"}
              </p>
              <p className={styles.dropZone__hint}>
                PNG, JPG, WEBP · Máx {MAX_FOTOS} imágenes · Quedan {MAX_FOTOS - total} espacio{MAX_FOTOS - total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Grid de previews */}
        {total > 0 && (
          <div className={styles.photoGrid}>
            {(data.previews || []).map((item, i) => (
              <div
                key={`${item.name}-${i}`}
                className={styles.photoThumb}
                onClick={() => setLightbox(item.url)}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className={styles.photoThumb__img}
                />
                <div className={styles.photoThumb__overlay}>
                  <button
                    type="button"
                    className={styles.photoThumb__delete}
                    onClick={(e) => { e.stopPropagation(); removeFoto(i); }}
                    aria-label="Eliminar foto"
                  >
                    <FiTrash2 size={14} />
                  </button>
                  <span className={styles.photoThumb__zoom}>
                    <FiZoomIn size={14} />
                  </span>
                </div>
                <span className={styles.photoThumb__name}>{item.name}</span>
              </div>
            ))}

            {/* Botón "Agregar más" dentro del grid si hay fotos pero no está lleno */}
            {!isFull && (
              <div
                className={styles.photoThumbAdd}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                aria-label="Agregar más fotos"
              >
                <FiPlus size={20} />
                <span>Agregar</span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* ── fin fotos ── */}

      {/* Lightbox simple */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightbox__close} onClick={() => setLightbox(null)} aria-label="Cerrar">
            <FiX size={20} />
          </button>
          <img src={lightbox} alt="Vista ampliada" className={styles.lightbox__img} />
        </div>
      )}

    </div>
  );
};


// Paso 3: Revisión preliminar 
const Paso3 = ({ equipoData, tiposDispositivo }) => {
  const tipo = tiposDispositivo.find((t) => t._id === equipoData.tipoDispositivoId);
  const preview = calcularPreview(tipo, equipoData);

  return (
    <div className={styles.stepContent}>
      <div className={styles.tip}>
        <FiInfo size={15} />
        <span>
          Monto <strong>estimado</strong>. Calculado según las características del equipo.
        </span>
      </div>

      <div className={styles.previewEquipo}>
        <h4>Resumen del equipo</h4>
        {[
          ["Tipo", tipo?.nombre || "—"],
          ["Marca", equipoData.marca],
          ["Modelo", equipoData.modelo],
          ["Antigüedad", `${equipoData.antiguedad} año${equipoData.antiguedad !== 1 ? "s" : ""}`],
          ["Condición", equipoData.condicionDeclarada],
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
          <big>Bs. {preview.total.toLocaleString("es-BO")}</big>
          <span>bolivianos</span>
        </div>

        <div className={styles.previewCard__regla}>
          <span>Precio base</span>
          <strong style={{ color: "#0E2A46" }}>
            Bs. {preview.base.toLocaleString("es-BO")}
          </strong>
        </div>

        {preview.reglas.map((r, i) => (
          <div key={i} className={styles.previewCard__regla}>
            <span>{r.desc}</span>
            <strong style={{ color: r.val >= 0 ? "#1A7A56" : "#FC6441" }}>
              {r.val >= 0 ? "+" : "−"} Bs. {Math.abs(r.val).toLocaleString("es-BO")}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

// Paso 4: Confirmación 
const Paso4 = ({ clienteData, equipoData, tiposDispositivo }) => {
  const tipo = tiposDispositivo.find((t) => t._id === equipoData.tipoDispositivoId);

  return (
    <div className={styles.stepContent}>
      <div className={styles.confirmStep}>
        <div className={styles.confirmStep__icon}>
          <FiSend size={32} />
        </div>

        <h3 className={styles.confirmStep__title}>Confirmación final</h3>
        <p className={styles.confirmStep__text}>
          Estás a punto de enviar tu solicitud para continuar con el proceso de cotización del equipo.
        </p>

        <div className={styles.confirmStep__summary}>
          <h4>Resumen final</h4>
          {[
            ["Cliente", clienteData.nombre],
            ["Equipo", `${equipoData.marca} ${equipoData.modelo}`],
            ["Tipo", tipo?.nombre || "—"],
            ["Condición", equipoData.condicionDeclarada || "—"],
            ["Canal", "Web"],
          ].map(([k, v]) => (
            <div key={k} className={styles.confirmStep__summary_row}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>

        <div className={styles.tip} style={{ marginTop: 16 }}>
          <FiInfo size={15} />
          <span>
            Al enviar esta solicitud, la <strong>cotización inicial o preliminar</strong> quedará registada en el sistema.
            Puedes aceptarla o rechazarla desde el panel de tus solicitudes. Si la aceptas, el proceso continuará con la etapa de envío del equipo para valoración física.
          </span>
        </div>
      </div>
    </div>
  );
};

// Modal principal 
const CreateSolicitudModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const tiposDispositivo = useSelector(selectTiposDispositivo) || [];

  console.log("Tipos dispositivo en CreateSolicitudModal:", tiposDispositivo);

  const [solicitudCreada, setSolicitudCreada] = useState(null);
  const isCreating = useSelector(selectCotizacionesCreating);
  const cotizacionesError = useSelector(selectCotizacionesError);

  const [paso, setPaso] = useState(1);
  const [errors, setErrors] = useState({});

  const [clienteData, setClienteData] = useState({
    id: "CLI-2024-0001",
    nombre:   "María García López",
    email:    "maria.garcia@email.com",
    telefono: "+591 70123456",
  });

  const [equipoData, setEquipoData] = useState({
    tipoDispositivoId: "",
    marca: "",
    modelo: "",
    antiguedad: "",
    condicionDeclarada: "",
    descripcion: "",
    archivos: [],
    previews: [],
    fotos: [],
  });

  useEffect(() => {
    dispatch(fetchTiposDispositivo({ tenantId: 1 }));
  }, [dispatch]);


  const handleClienteChange = useCallback((field, value) => {
    setClienteData((p) => ({ ...p, [field]: value }));
    setErrors((p) => {
      const c = { ...p };
      delete c[field];
      return c;
    });
  }, []);

  const handleEquipoChange = useCallback((field, value) => {
    setEquipoData((p) => ({ ...p, [field]: value }));
    setErrors((p) => {
      const c = { ...p };
      delete c[field];
      return c;
    });
  }, []);

  const avanzar = async () => {
    if (paso === 1) {
      const errs = validar1(clienteData);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }

    if (paso === 2) {
      const errs = validar2(equipoData);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }

    if (paso === 4) {
      await enviar();
      return;
    }

    setErrors({});
    setPaso((p) => p + 1);
  };

  const retroceder = () => {
    if (paso === 1) {
      onClose();
      return;
    }
    setPaso((p) => p - 1);
    setErrors({});
  };

  const enviar = async () => {
  try {
    const fotosSubidas = await subirImagenesSolicitud(equipoData.archivos);

    const resultAction = await dispatch(
      crearSolicitudCotizacion({
        tenantId: 1,
        cliente: {
          id: clienteData.id,
          nombre: clienteData.nombre,
          email: clienteData.email,
          telefono: clienteData.telefono,
        },
        tipoDispositivoId: equipoData.tipoDispositivoId,
        datosEquipo: {
          marca: equipoData.marca,
          modelo: equipoData.modelo,
          antiguedad: Number(equipoData.antiguedad),
          condicionDeclarada: equipoData.condicionDeclarada,
          descripcion: equipoData.descripcion,
          fotos: fotosSubidas,
        },
      })
    );

    if (crearSolicitudCotizacion.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
      onClose?.();
    }
  } catch (error) {
    console.error("Error al enviar solicitud:", error);
  }
};

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return (
          <Paso1
            data={clienteData}
            onChange={handleClienteChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <Paso2
            data={equipoData}
            onChange={handleEquipoChange}
            errors={errors}
            tiposDispositivo={tiposDispositivo}
          />
        );
      case 3:
        return (
          <Paso3
            equipoData={equipoData}
            tiposDispositivo={tiposDispositivo}
          />
        );
      case 4:
        return (
          <Paso4
            clienteData={clienteData}
            equipoData={equipoData}
            tiposDispositivo={tiposDispositivo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Nueva solicitud">
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

        <div className={styles.stepper}>
          {PASOS.map((p, idx) => {
            const estado = paso > p.id ? "done" : paso === p.id ? "active" : "pending";
            const Icon = p.icon;

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

        <div className={styles.body}>
          {renderPaso()}
          {cotizacionesError && (
            <div style={{ marginTop: 12, color: "#B82020", fontSize: 14 }}>
              {typeof cotizacionesError === "string"
                ? cotizacionesError
                : cotizacionesError?.message || "Ocurrió un error"}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.footer__back}
            onClick={retroceder}
            disabled={isCreating}
          >
            <FiArrowLeft size={15} />
            {paso === 1 ? "Cancelar" : "Atrás"}
          </button>

          <button
            className={styles.footer__next}
            onClick={avanzar}
            disabled={isCreating}
          >
            {isCreating ? (
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
};
export default CreateSolicitudModal;