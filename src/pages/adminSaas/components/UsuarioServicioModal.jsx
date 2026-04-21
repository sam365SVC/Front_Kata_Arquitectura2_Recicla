import React, { useEffect, useMemo, useState } from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiShield,
  FiLock,
  FiCheck,
  FiAlertCircle,
  FiSave,
  FiMapPin,
  FiToggleLeft,
} from "react-icons/fi";
import styles from "./UsuarioEmpresaModal.module.scss";

const ROLES = [
  "Administrador",
  "Supervisor",
  "Inspector",
  "Operador",
  "Recepcionista",
];

const CARGOS = [
  "Administrador general",
  "Supervisor de recepción",
  "Inspector técnico",
  "Operador de recepción",
  "Recepcionista principal",
  "Encargado de logística",
  "Coordinador de operaciones",
];

const AREAS = [
  "Administración",
  "Recepción",
  "Inspección técnica",
  "Operaciones",
  "Logística",
];

const ESTADOS = ["Activo", "Inactivo"];

const PASSWORD_RULES = {
  minLength: (value) => value.length >= 8,
  upper: (value) => /[A-Z]/.test(value),
  lower: (value) => /[a-z]/.test(value),
  number: (value) => /[0-9]/.test(value),
  special: (value) => /[^A-Za-z0-9]/.test(value),
};

const getPasswordChecks = (password) => ({
  minLength: PASSWORD_RULES.minLength(password),
  upper: PASSWORD_RULES.upper(password),
  lower: PASSWORD_RULES.lower(password),
  number: PASSWORD_RULES.number(password),
  special: PASSWORD_RULES.special(password),
});

const isPasswordStrong = (password) => {
  const checks = getPasswordChecks(password);
  return Object.values(checks).every(Boolean);
};

const initialForm = {
  id: null,
  nombre: "",
  email: "",
  telefono: "",
  cargo: "Operador de recepción",
  rol: "Operador",
  area: "Operaciones",
  estado: "Activo",
  password: "",
};

const SelectorPills = ({
  label,
  icon,
  options,
  value,
  onChange,
  error,
  columns = 3,
}) => {
  const Icon = icon;

  return (
    <div className={`${styles.formGroup} ${error ? styles["formGroup--error"] : ""}`}>
      <label className={styles.formGroup__label}>
        {Icon ? <Icon size={14} /> : null}
        {label}
      </label>

      <div
        className={`${styles.pillsGrid} ${
          columns === 2 ? styles["pillsGrid--2"] : ""
        } ${columns === 4 ? styles["pillsGrid--4"] : ""}`}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.pillButton} ${
              value === option ? styles["pillButton--active"] : ""
            }`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
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

const UsuarioServicioModal = ({
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
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isEditMode && userData) {
      setForm({
        id: userData.id || null,
        nombre: userData.nombre || "",
        email: userData.email || "",
        telefono: userData.telefono || "",
        cargo: userData.cargo || "Operador de recepción",
        rol: userData.rol || "Operador",
        area: userData.area || "Operaciones",
        estado: userData.estado || "Activo",
        password: "",
      });
      setChangePassword(false);
      setErrors({});
      return;
    }

    setForm(initialForm);
    setChangePassword(false);
    setErrors({});
  }, [open, isEditMode, userData]);

  const passwordChecks = useMemo(
    () => getPasswordChecks(form.password || ""),
    [form.password]
  );

  const shouldValidatePassword = !isEditMode || changePassword;

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

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";

    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Ingresa un correo válido.";
    } else {
      const duplicated = existingUsers.some((user) => {
        const sameEmail =
          String(user.email || "").trim().toLowerCase() ===
          form.email.trim().toLowerCase();

        if (isEditMode) {
          return sameEmail && user.id !== form.id;
        }

        return sameEmail;
      });

      if (duplicated) {
        newErrors.email = "Ya existe un usuario con ese correo.";
      }
    }

    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio.";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(form.telefono.trim())) {
      newErrors.telefono = "Ingresa un teléfono válido.";
    }

    if (!form.cargo.trim()) newErrors.cargo = "Selecciona un cargo.";
    if (!form.rol.trim()) newErrors.rol = "Selecciona un rol.";
    if (!form.area.trim()) newErrors.area = "Selecciona un área.";
    if (!form.estado.trim()) newErrors.estado = "Selecciona un estado.";

    if (shouldValidatePassword) {
      if (!form.password.trim()) {
        newErrors.password = "La contraseña es obligatoria.";
      } else if (!isPasswordStrong(form.password.trim())) {
        newErrors.password =
          "La contraseña no cumple con todos los requisitos.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      ...form,
      nombre: form.nombre.trim(),
      email: form.email.trim().toLowerCase(),
      telefono: form.telefono.trim(),
      cargo: form.cargo.trim(),
      rol: form.rol.trim(),
      area: form.area.trim(),
      estado: form.estado.trim(),
      password: shouldValidatePassword ? form.password.trim() : undefined,
    };

    onSubmit(payload, { isEditMode, changePassword });
  };

  if (!open) return null;

  const title = isEditMode ? "Editar usuario" : "Nuevo usuario";
  const subtitle = isEditMode
    ? "Actualiza la información del usuario de empresa."
    : "Completa los datos para registrar un nuevo usuario interno.";

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
                Nombre completo *
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej: Carlos Mendoza"
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
              />
              {errors.email && (
                <span className={styles.formGroup__error}>
                  <FiAlertCircle size={12} />
                  {errors.email}
                </span>
              )}
            </div>

            <div
              className={`${styles.formGroup} ${
                errors.telefono ? styles["formGroup--error"] : ""
              }`}
            >
              <label className={styles.formGroup__label}>
                <FiPhone size={14} />
                Teléfono *
              </label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="+591 70000000"
              />
              {errors.telefono && (
                <span className={styles.formGroup__error}>
                  <FiAlertCircle size={12} />
                  {errors.telefono}
                </span>
              )}
            </div>
          </div>

          <div className={styles.sectionDivider} />

          <SelectorPills
            label="Cargo *"
            icon={FiBriefcase}
            options={CARGOS}
            value={form.cargo}
            onChange={(value) => handleChange("cargo", value)}
            error={errors.cargo}
            columns={2}
          />

          <div className={styles.sectionDivider} />

          <SelectorPills
            label="Rol *"
            icon={FiShield}
            options={ROLES}
            value={form.rol}
            onChange={(value) => handleChange("rol", value)}
            error={errors.rol}
            columns={3}
          />

          <div className={styles.sectionDivider} />

          <SelectorPills
            label="Área *"
            icon={FiMapPin}
            options={AREAS}
            value={form.area}
            onChange={(value) => handleChange("area", value)}
            error={errors.area}
            columns={3}
          />

          <div className={styles.sectionDivider} />

          <SelectorPills
            label="Estado *"
            icon={FiToggleLeft}
            options={ESTADOS}
            value={form.estado}
            onChange={(value) => handleChange("estado", value)}
            error={errors.estado}
            columns={2}
          />

          {isEditMode && (
            <div className={styles.passwordToggle}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                />
                <span>Cambiar contraseña</span>
              </label>
            </div>
          )}

          {shouldValidatePassword && (
            <div className={styles.passwordBox}>
              <div
                className={`${styles.formGroup} ${
                  errors.password ? styles["formGroup--error"] : ""
                }`}
              >
                <label className={styles.formGroup__label}>
                  <FiLock size={14} />
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Crea una contraseña segura"
                />
                {errors.password && (
                  <span className={styles.formGroup__error}>
                    <FiAlertCircle size={12} />
                    {errors.password}
                  </span>
                )}
              </div>

              <div className={styles.passwordChecks}>
                <p className={styles.passwordChecks__title}>
                  La contraseña debe cumplir con:
                </p>

                <ul className={styles.passwordChecks__list}>
                  <li
                    className={
                      passwordChecks.minLength
                        ? styles["passwordChecks__item--ok"]
                        : ""
                    }
                  >
                    <FiCheck size={13} />
                    Al menos 8 caracteres
                  </li>
                  <li
                    className={
                      passwordChecks.upper
                        ? styles["passwordChecks__item--ok"]
                        : ""
                    }
                  >
                    <FiCheck size={13} />
                    Una letra mayúscula
                  </li>
                  <li
                    className={
                      passwordChecks.lower
                        ? styles["passwordChecks__item--ok"]
                        : ""
                    }
                  >
                    <FiCheck size={13} />
                    Una letra minúscula
                  </li>
                  <li
                    className={
                      passwordChecks.number
                        ? styles["passwordChecks__item--ok"]
                        : ""
                    }
                  >
                    <FiCheck size={13} />
                    Un número
                  </li>
                  <li
                    className={
                      passwordChecks.special
                        ? styles["passwordChecks__item--ok"]
                        : ""
                    }
                  >
                    <FiCheck size={13} />
                    Un carácter especial
                  </li>
                </ul>
              </div>
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
              {isEditMode ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioServicioModal;