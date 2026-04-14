import React, { useEffect, useMemo, useState } from "react";
import {
  FiX,
  FiCpu,
  FiHash,
  FiType,
  FiDollarSign,
  FiToggleLeft,
  FiPlus,
  FiTrash2,
  FiCheckSquare,
  FiList,
  FiSave,
  FiAlertCircle,
} from "react-icons/fi";
import styles from "./TipoDispositivoModal.module.scss";

const ESTADOS = [
  { label: "Activo", value: true },
  { label: "Inactivo", value: false },
];

const OPERADORES = ["=", "!=", ">", "<", ">=", "<="];

const CAMPOS_REGLA = [
  { label: "Antigüedad", value: "antiguedad" },
  { label: "Condición declarada", value: "condicionDeclarada" },
  { label: "Marca", value: "marca" },
  { label: "Modelo", value: "modelo" },
  { label: "Capacidad", value: "capacidad" },
  { label: "Color", value: "color" },
];

const buildEmptyRule = (index = 0) => ({
  codigo: "",
  descripcion: "",
  campo: "antiguedad",
  operador: "=",
  valor: "",
  ajusteMonto: 0,
  tempId: `rule-${Date.now()}-${index}`,
});

const buildEmptyChecklistItem = (index = 0) => ({
  codigo: "",
  descripcion: "",
  obligatorio: true,
  tempId: `check-${Date.now()}-${index}`,
});

const getSafeString = (value) => String(value || "").trim();

const TipoDispositivoModal = ({
  open,
  mode = "create",
  tenantId = 1,
  initialData = null,
  onClose,
  onSubmit,
}) => {
  const isEditMode = mode === "edit";

  const [form, setForm] = useState({
    tenantId,
    codigo: "",
    nombre: "",
    activo: true,
    precioBase: "",
    reglasCotizacion: [buildEmptyRule(1)],
    checklistInspeccion: [buildEmptyChecklistItem(1)],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (isEditMode && initialData) {
      setForm({
        tenantId: initialData.tenantId ?? tenantId,
        codigo: initialData.codigo || "",
        nombre: initialData.nombre || "",
        activo:
          typeof initialData.activo === "boolean" ? initialData.activo : true,
        precioBase:
          initialData.precioBase !== undefined && initialData.precioBase !== null
            ? String(initialData.precioBase)
            : "",
        reglasCotizacion:
          Array.isArray(initialData.reglasCotizacion) &&
          initialData.reglasCotizacion.length > 0
            ? initialData.reglasCotizacion.map((item, index) => ({
                ...item,
                valor:
                  item?.valor === undefined || item?.valor === null
                    ? ""
                    : String(item.valor),
                ajusteMonto:
                  item?.ajusteMonto === undefined || item?.ajusteMonto === null
                    ? 0
                    : item.ajusteMonto,
                tempId: `rule-edit-${Date.now()}-${index}`,
              }))
            : [buildEmptyRule(1)],
        checklistInspeccion:
          Array.isArray(initialData.checklistInspeccion) &&
          initialData.checklistInspeccion.length > 0
            ? initialData.checklistInspeccion.map((item, index) => ({
                ...item,
                obligatorio:
                  typeof item?.obligatorio === "boolean"
                    ? item.obligatorio
                    : true,
                tempId: `check-edit-${Date.now()}-${index}`,
              }))
            : [buildEmptyChecklistItem(1)],
      });
    } else {
      setForm({
        tenantId,
        codigo: "",
        nombre: "",
        activo: true,
        precioBase: "",
        reglasCotizacion: [buildEmptyRule(1)],
        checklistInspeccion: [buildEmptyChecklistItem(1)],
      });
    }

    setErrors({});
  }, [open, isEditMode, initialData, tenantId]);

  const totalReglas = useMemo(
    () => form.reglasCotizacion.filter((item) => item).length,
    [form.reglasCotizacion]
  );

  const totalChecklist = useMemo(
    () => form.checklistInspeccion.filter((item) => item).length,
    [form.checklistInspeccion]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleRuleChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      reglasCotizacion: prev.reglasCotizacion.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    setErrors((prev) => ({
      ...prev,
      [`regla_${index}_${field}`]: "",
      reglasCotizacion: "",
    }));
  };

  const handleChecklistChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      checklistInspeccion: prev.checklistInspeccion.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    setErrors((prev) => ({
      ...prev,
      [`check_${index}_${field}`]: "",
      checklistInspeccion: "",
    }));
  };

  const addRule = () => {
    setForm((prev) => ({
      ...prev,
      reglasCotizacion: [
        ...prev.reglasCotizacion,
        buildEmptyRule(prev.reglasCotizacion.length + 1),
      ],
    }));
  };

  const removeRule = (index) => {
    setForm((prev) => ({
      ...prev,
      reglasCotizacion:
        prev.reglasCotizacion.length === 1
          ? [buildEmptyRule(1)]
          : prev.reglasCotizacion.filter((_, i) => i !== index),
    }));
  };

  const addChecklistItem = () => {
    setForm((prev) => ({
      ...prev,
      checklistInspeccion: [
        ...prev.checklistInspeccion,
        buildEmptyChecklistItem(prev.checklistInspeccion.length + 1),
      ],
    }));
  };

  const removeChecklistItem = (index) => {
    setForm((prev) => ({
      ...prev,
      checklistInspeccion:
        prev.checklistInspeccion.length === 1
          ? [buildEmptyChecklistItem(1)]
          : prev.checklistInspeccion.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!getSafeString(form.codigo)) {
      newErrors.codigo = "El código es obligatorio.";
    }

    if (!getSafeString(form.nombre)) {
      newErrors.nombre = "El nombre es obligatorio.";
    }

    if (form.precioBase === "" || form.precioBase === null) {
      newErrors.precioBase = "El precio base es obligatorio.";
    } else if (Number.isNaN(Number(form.precioBase)) || Number(form.precioBase) < 0) {
      newErrors.precioBase =
        "El precio base debe ser un número mayor o igual a 0.";
    }

    if (!Array.isArray(form.reglasCotizacion)) {
      newErrors.reglasCotizacion = "Las reglas deben enviarse como arreglo.";
    } else {
      form.reglasCotizacion.forEach((regla, index) => {
        if (!getSafeString(regla.codigo)) {
          newErrors[`regla_${index}_codigo`] = "Código obligatorio.";
        }

        if (!getSafeString(regla.descripcion)) {
          newErrors[`regla_${index}_descripcion`] = "Descripción obligatoria.";
        }

        if (!getSafeString(regla.campo)) {
          newErrors[`regla_${index}_campo`] = "Campo obligatorio.";
        }

        if (!OPERADORES.includes(regla.operador)) {
          newErrors[`regla_${index}_operador`] = "Operador inválido.";
        }

        if (regla.valor === "" || regla.valor === null || regla.valor === undefined) {
          newErrors[`regla_${index}_valor`] = "Valor obligatorio.";
        }

        if (
          regla.ajusteMonto === "" ||
          regla.ajusteMonto === null ||
          Number.isNaN(Number(regla.ajusteMonto))
        ) {
          newErrors[`regla_${index}_ajusteMonto`] =
            "El ajuste debe ser numérico.";
        }
      });
    }

    if (!Array.isArray(form.checklistInspeccion)) {
      newErrors.checklistInspeccion =
        "El checklist debe enviarse como arreglo.";
    } else {
      form.checklistInspeccion.forEach((item, index) => {
        if (!getSafeString(item.codigo)) {
          newErrors[`check_${index}_codigo`] = "Código obligatorio.";
        }

        if (!getSafeString(item.descripcion)) {
          newErrors[`check_${index}_descripcion`] = "Descripción obligatoria.";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    tenantId: Number(form.tenantId),
    codigo: getSafeString(form.codigo),
    nombre: getSafeString(form.nombre),
    activo: Boolean(form.activo),
    precioBase: Number(form.precioBase),
    reglasCotizacion: form.reglasCotizacion.map((regla) => ({
      codigo: getSafeString(regla.codigo),
      descripcion: getSafeString(regla.descripcion),
      campo: getSafeString(regla.campo),
      operador: getSafeString(regla.operador),
      valor:
        regla.valor !== "" && !Number.isNaN(Number(regla.valor))
          ? Number(regla.valor)
          : getSafeString(regla.valor),
      ajusteMonto: Number(regla.ajusteMonto),
    })),
    checklistInspeccion: form.checklistInspeccion.map((item) => ({
      codigo: getSafeString(item.codigo),
      descripcion: getSafeString(item.descripcion),
      obligatorio: Boolean(item.obligatorio),
    })),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(buildPayload(), {
      isEditMode,
      originalItem: initialData,
    });
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div>
            <h3 className={styles.header__title}>
              <FiCpu size={18} />
              {isEditMode ? "Editar tipo de dispositivo" : "Nuevo tipo de dispositivo"}
            </h3>
            <p className={styles.header__sub}>
              {isEditMode
                ? "Actualiza la configuración del tipo de dispositivo, sus reglas y checklist."
                : "Registra un nuevo tipo de dispositivo con precio base, reglas de cotización y checklist de inspección."}
            </p>
          </div>

          <button
            type="button"
            className={styles.header__close}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <FiX />
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <FiCpu size={16} />
              <span>Información general</span>
            </div>

            <div className={styles.grid}>
              <div
                className={`${styles.formGroup} ${
                  errors.codigo ? styles["formGroup--error"] : ""
                }`}
              >
                <label className={styles.formGroup__label}>
                  <FiHash size={14} />
                  Código *
                </label>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  placeholder="Ej: SMAR"
                />
                {errors.codigo && (
                  <span className={styles.formGroup__error}>
                    <FiAlertCircle size={12} />
                    {errors.codigo}
                  </span>
                )}
              </div>

              <div
                className={`${styles.formGroup} ${
                  errors.nombre ? styles["formGroup--error"] : ""
                }`}
              >
                <label className={styles.formGroup__label}>
                  <FiType size={14} />
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Ej: Smartphone"
                />
                {errors.nombre && (
                  <span className={styles.formGroup__error}>
                    <FiAlertCircle size={12} />
                    {errors.nombre}
                  </span>
                )}
              </div>

              <div
                className={`${styles.formGroup} ${
                  errors.precioBase ? styles["formGroup--error"] : ""
                }`}
              >
                <label className={styles.formGroup__label}>
                  <FiDollarSign size={14} />
                  Precio base *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precioBase}
                  onChange={(e) => handleChange("precioBase", e.target.value)}
                  placeholder="Ej: 3000"
                />
                {errors.precioBase && (
                  <span className={styles.formGroup__error}>
                    <FiAlertCircle size={12} />
                    {errors.precioBase}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.stateRow}>
              <span className={styles.stateRow__label}>Estado</span>
              <div className={styles.stateButtons}>
                {ESTADOS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`${styles.stateButton} ${
                      form.activo === item.value
                        ? styles["stateButton--active"]
                        : ""
                    }`}
                    onClick={() => handleChange("activo", item.value)}
                  >
                    <FiToggleLeft size={15} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <FiList size={16} />
                <span>Reglas de cotización</span>
              </div>

              <button
                type="button"
                className={styles.addButton}
                onClick={addRule}
              >
                <FiPlus size={14} />
                Añadir regla
              </button>
            </div>

            <div className={styles.helperText}>
              Configura reglas que ajusten el monto según campo, operador y valor.
            </div>

            <div className={styles.itemsStack}>
              {form.reglasCotizacion.map((regla, index) => (
                <div key={regla.tempId} className={styles.itemCard}>
                  <div className={styles.itemCard__header}>
                    <h4>Regla {index + 1}</h4>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => removeRule(index)}
                    >
                      <FiTrash2 size={14} />
                      Quitar
                    </button>
                  </div>

                  <div className={styles.grid}>
                    <div
                      className={`${styles.formGroup} ${
                        errors[`regla_${index}_codigo`]
                          ? styles["formGroup--error"]
                          : ""
                      }`}
                    >
                      <label className={styles.formGroup__label}>Código *</label>
                      <input
                        type="text"
                        value={regla.codigo}
                        onChange={(e) =>
                          handleRuleChange(index, "codigo", e.target.value)
                        }
                        placeholder="Ej: antiguedad_1_ano"
                      />
                      {errors[`regla_${index}_codigo`] && (
                        <span className={styles.formGroup__error}>
                          <FiAlertCircle size={12} />
                          {errors[`regla_${index}_codigo`]}
                        </span>
                      )}
                    </div>

                    <div
                      className={`${styles.formGroup} ${
                        errors[`regla_${index}_descripcion`]
                          ? styles["formGroup--error"]
                          : ""
                      }`}
                    >
                      <label className={styles.formGroup__label}>
                        Descripción *
                      </label>
                      <input
                        type="text"
                        value={regla.descripcion}
                        onChange={(e) =>
                          handleRuleChange(index, "descripcion", e.target.value)
                        }
                        placeholder="Ej: Descuento por 1 año de uso"
                      />
                      {errors[`regla_${index}_descripcion`] && (
                        <span className={styles.formGroup__error}>
                          <FiAlertCircle size={12} />
                          {errors[`regla_${index}_descripcion`]}
                        </span>
                      )}
                    </div>

                    <div
                      className={`${styles.formGroup} ${
                        errors[`regla_${index}_campo`]
                          ? styles["formGroup--error"]
                          : ""
                      }`}
                    >
                      <label className={styles.formGroup__label}>Campo *</label>
                      <select
                        value={regla.campo}
                        onChange={(e) =>
                          handleRuleChange(index, "campo", e.target.value)
                        }
                      >
                        {CAMPOS_REGLA.map((campo) => (
                          <option key={campo.value} value={campo.value}>
                            {campo.label}
                          </option>
                        ))}
                      </select>
                      {errors[`regla_${index}_campo`] && (
                        <span className={styles.formGroup__error}>
                          <FiAlertCircle size={12} />
                          {errors[`regla_${index}_campo`]}
                        </span>
                      )}
                    </div>

                    <div
                      className={`${styles.formGroup} ${
                        errors[`regla_${index}_operador`]
                          ? styles["formGroup--error"]
                          : ""
                      }`}
                    >
                      <label className={styles.formGroup__label}>Operador *</label>
                      <select
                        value={regla.operador}
                        onChange={(e) =>
                          handleRuleChange(index, "operador", e.target.value)
                        }
                      >
                        {OPERADORES.map((operador) => (
                          <option key={operador} value={operador}>
                            {operador}
                          </option>
                        ))}
                      </select>
                      {errors[`regla_${index}_operador`] && (
                        <span className={styles.formGroup__error}>
                          <FiAlertCircle size={12} />
                          {errors[`regla_${index}_operador`]}
                        </span>
                      )}
                    </div>

                    <div
                      className={`${styles.formGroup} ${
                        errors[`regla_${index}_valor`]
                          ? styles["formGroup--error"]
                          : ""
                      }`}
                    >
                      <label className={styles.formGroup__label}>Valor *</label>
                      <input
                        type="text"
                        value={regla.valor}
                        onChange={(e) =>
                          handleRuleChange(index, "valor", e.target.value)
                        }
                        placeholder="Ej: 1 o Apple"
                      />
                      {errors[`regla_${index}_valor`] && (
                        <span className={styles.formGroup__error}>
                          <FiAlertCircle size={12} />
                          {errors[`regla_${index}_valor`]}
                        </span>
                      )}
                    </div>

                    <div
                      className={`${styles.formGroup} ${
                        errors[`regla_${index}_ajusteMonto`]
                          ? styles["formGroup--error"]
                          : ""
                      }`}
                    >
                      <label className={styles.formGroup__label}>
                        Ajuste monto *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={regla.ajusteMonto}
                        onChange={(e) =>
                          handleRuleChange(index, "ajusteMonto", e.target.value)
                        }
                        placeholder="Ej: -300 o 500"
                      />
                      {errors[`regla_${index}_ajusteMonto`] && (
                        <span className={styles.formGroup__error}>
                          <FiAlertCircle size={12} />
                          {errors[`regla_${index}_ajusteMonto`]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryRow}>
              <span>Total de reglas: {totalReglas}</span>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <FiCheckSquare size={16} />
                <span>Checklist de inspección</span>
              </div>

              <button
                type="button"
                className={styles.addButton}
                onClick={addChecklistItem}
              >
                <FiPlus size={14} />
                Añadir ítem
              </button>
            </div>

            <div className={styles.helperText}>
              Define los puntos que se revisarán durante la inspección del equipo.
            </div>

            <div className={styles.itemsStack}>
              {form.checklistInspeccion.map((item, index) => (
                <div key={item.tempId} className={styles.itemCard}>
                  <div className={styles.itemCard__header}>
                    <h4>Ítem {index + 1}</h4>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => removeChecklistItem(index)}
                    >
                      <FiTrash2 size={14} />
                      Quitar
                    </button>
                  </div>

                  <div className={styles.grid}>
                    <div
                      className={`${styles.formGroup} ${
                        errors[`check_${index}_codigo`]
                          ? styles["formGroup--error"]
                          : ""
                      }`}
                    >
                      <label className={styles.formGroup__label}>Código *</label>
                      <input
                        type="text"
                        value={item.codigo}
                        onChange={(e) =>
                          handleChecklistChange(index, "codigo", e.target.value)
                        }
                        placeholder="Ej: enciende"
                      />
                      {errors[`check_${index}_codigo`] && (
                        <span className={styles.formGroup__error}>
                          <FiAlertCircle size={12} />
                          {errors[`check_${index}_codigo`]}
                        </span>
                      )}
                    </div>

                    <div
                      className={`${styles.formGroup} ${
                        errors[`check_${index}_descripcion`]
                          ? styles["formGroup--error"]
                          : ""
                      }`}
                    >
                      <label className={styles.formGroup__label}>
                        Descripción *
                      </label>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) =>
                          handleChecklistChange(
                            index,
                            "descripcion",
                            e.target.value
                          )
                        }
                        placeholder="Ej: ¿El equipo enciende correctamente?"
                      />
                      {errors[`check_${index}_descripcion`] && (
                        <span className={styles.formGroup__error}>
                          <FiAlertCircle size={12} />
                          {errors[`check_${index}_descripcion`]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.stateRow}>
                    <span className={styles.stateRow__label}>Obligatoriedad</span>
                    <div className={styles.stateButtons}>
                      <button
                        type="button"
                        className={`${styles.stateButton} ${
                          item.obligatorio ? styles["stateButton--active"] : ""
                        }`}
                        onClick={() =>
                          handleChecklistChange(index, "obligatorio", true)
                        }
                      >
                        Obligatorio
                      </button>

                      <button
                        type="button"
                        className={`${styles.stateButton} ${
                          item.obligatorio === false
                            ? styles["stateButton--active"]
                            : ""
                        }`}
                        onClick={() =>
                          handleChecklistChange(index, "obligatorio", false)
                        }
                      >
                        Opcional
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryRow}>
              <span>Total de ítems: {totalChecklist}</span>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button type="submit" className={styles.primaryButton}>
              <FiSave size={15} />
              {isEditMode ? "Guardar cambios" : "Crear tipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TipoDispositivoModal;