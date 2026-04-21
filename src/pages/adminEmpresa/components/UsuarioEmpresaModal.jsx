import React, { useEffect, useMemo, useState } from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiShield,
  FiAlertCircle,
  FiSave,
  FiTruck,
  FiSearch,
  FiClipboard,
  FiSettings,
} from "react-icons/fi";
import styles from "./UsuarioEmpresaModal.module.scss";

const ROLES = [
  {
    label: "Admin logística",
    value: "ADMIN_LOGISTICA",
    description: "Gestiona operaciones y personal logístico.",
    icon: FiSettings,
  },
  {
    label: "Despachador",
    value: "DESPACHADOR",
    description: "Coordina rutas y asignaciones.",
    icon: FiClipboard,
  },
  {
    label: "Inspector",
    value: "INSPECTOR",
    description: "Revisa equipos y valida condiciones.",
    icon: FiSearch,
  },
  {
    label: "Conductor",
    value: "CONDUCTOR",
    description: "Realiza traslados y entregas.",
    icon: FiTruck,
  },
];

const initialForm = {
  id: null,
  nombre: "",
  apellido: "",
  email: "",
  rol: "DESPACHADOR",
};

const RoleCards = ({
  label,
  icon,
  options,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const Icon = icon;

  return (
    <div
      className={`${styles.formGroup} ${
        error ? styles["formGroup--error"] : ""
      }`}
    >
      <label className={styles.formGroup__label}>
        {Icon ? <Icon size={14} /> : null}
        {label}
      </label>

      <div className={styles.roleGrid}>
        {options.map((option) => {
          const RoleIcon = option.icon;
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.roleCard} ${
                isActive ? styles["roleCard--active"] : ""
              } ${disabled ? styles["roleCard--disabled"] : ""}`}
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
            >
              <span className={styles.roleCard__icon}>
                <RoleIcon size={15} />
              </span>

              <span className={styles.roleCard__text}>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <span className={styles.formGroup__error}>
          <FiAlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
};

const UsuarioEmpresaModal = ({
  open,
  mode = "create",
  userData = null,
  existingUsers = [],
  onClose,
  onSubmit,
}) => {
  const isEditMode = mode === "edit";

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (isEditMode && userData) {
      setForm({
        id: userData.id || null,
        nombre: userData.nombreRaw || userData.nombre || "",
        apellido: userData.apellidoRaw || "",
        email: userData.email || "",
        rol: userData.rolBackend || "DESPACHADOR",
      });
      setErrors({});
      return;
    }

    setForm(initialForm);
    setErrors({});
  }, [open, isEditMode, userData]);

  const rolSeleccionado = useMemo(
    () => ROLES.find((item) => item.value === form.rol),
    [form.rol]
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

  const validate = () => {
    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    }

    if (!form.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio.";
    }

    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Ingresa un correo válido.";
    } else if (!isEditMode) {
      const duplicated = existingUsers.some((user) => {
        return (
          String(user.email || "").trim().toLowerCase() ===
          form.email.trim().toLowerCase()
        );
      });

      if (duplicated) {
        newErrors.email = "Ya existe un usuario con ese correo.";
      }
    }

    if (!form.rol.trim()) {
      newErrors.rol = "Selecciona un rol.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      id: form.id,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim().toLowerCase(),
      rol: form.rol,
    };

    onSubmit(payload, { isEditMode });
  };

  if (!open) return null;

  const title = isEditMode ? "Editar usuario" : "Invitar usuario";
  const subtitle = isEditMode
    ? "Actualiza los datos básicos del usuario."
    : "Completa los datos para enviar una invitación a un nuevo integrante.";

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
              <FiUser size={18} />
              {title}
            </h3>
            <p className={styles.header__sub}>{subtitle}</p>
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
          <div className={styles.grid}>
            <div
              className={`${styles.formGroup} ${
                errors.nombre ? styles["formGroup--error"] : ""
              }`}
            >
              <label className={styles.formGroup__label}>
                <FiUser size={14} />
                Nombre *
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej: Carlos"
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
                errors.apellido ? styles["formGroup--error"] : ""
              }`}
            >
              <label className={styles.formGroup__label}>
                <FiUser size={14} />
                Apellido *
              </label>
              <input
                type="text"
                value={form.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                placeholder="Ej: Mendoza"
              />
              {errors.apellido && (
                <span className={styles.formGroup__error}>
                  <FiAlertCircle size={12} />
                  {errors.apellido}
                </span>
              )}
            </div>
          </div>

          <div
            className={`${styles.formGroup} ${
              errors.email ? styles["formGroup--error"] : ""
            }`}
          >
            <label className={styles.formGroup__label}>
              <FiMail size={14} />
              Correo electrónico *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="usuario@empresa.com"
              disabled={isEditMode}
            />
            {errors.email && (
              <span className={styles.formGroup__error}>
                <FiAlertCircle size={12} />
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.sectionDivider} />

          <RoleCards
            label="Rol del usuario *"
            icon={FiShield}
            options={ROLES}
            value={form.rol}
            onChange={(value) => handleChange("rol", value)}
            error={errors.rol}
            disabled={isEditMode}
          />

          {isEditMode && (
            <div className={styles.readOnlyInfo}>
              <p>
                El correo y el rol se muestran solo como referencia. Desde este
                panel actualmente solo puedes actualizar nombre y apellido.
              </p>
              {rolSeleccionado && <span>{rolSeleccionado.label}</span>}
            </div>
          )}

        

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
              {isEditMode ? "Guardar cambios" : "Enviar invitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioEmpresaModal;