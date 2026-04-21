import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiHome,
  FiLock,
  FiEye,
  FiEyeOff,
  FiInfo,
} from "react-icons/fi";

import Breadcrumb from "../../components/Breadcrumb";
import RightArrow from "../../components/SVG";
import "./Registro.scss";

const PAGO_OPTIONS = [
  { value: "", label: "Seleccione método de pago *" },
  { value: "tarjeta", label: "Tarjeta de Crédito/Débito" },
  { value: "transferencia", label: "Transferencia Bancaria" },
  { value: "efectivo", label: "Efectivo" },
];

const rules = {
  "c-nombre": (v) => (!v ? "El nombre es obligatorio" : ""),
  "c-apellido": (v) => (!v ? "El apellido es obligatorio" : ""),
  "c-email": (v) =>
    !v ? "El correo es obligatorio" : !/\S+@\S+\.\S+/.test(v) ? "Correo inválido" : "",
  "c-telefono": (v) => (!v ? "El teléfono es obligatorio" : ""),
  "c-direccion": (v) => (!v ? "La dirección es obligatoria" : ""),
  "c-metodo_pago": (v) => (!v ? "Seleccione un método de pago" : ""),

  "e-nombre_empresa": (v) => (!v ? "El nombre de la empresa es obligatorio" : ""),
  "e-email_contacto": (v) =>
    !v ? "El email de contacto es obligatorio" : !/\S+@\S+\.\S+/.test(v) ? "Correo inválido" : "",
  "e-telefono": (v) => (!v ? "El teléfono es obligatorio" : ""),
  "e-nombre": (v) => (!v ? "El nombre del administrador es obligatorio" : ""),
  "e-apellido": (v) => (!v ? "El apellido del administrador es obligatorio" : ""),
  "e-email": (v) =>
    !v ? "El email del administrador es obligatorio" : !/\S+@\S+\.\S+/.test(v) ? "Correo inválido" : "",

  password: (v) => {
    if (!v) return "La contraseña es obligatoria";
    if (v.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(v)) return "Debe contener al menos 1 mayúscula";
    if (!/[0-9]/.test(v)) return "Debe contener al menos 1 número";
    return "";
  },

  confirm_password: (v, fields) => {
    if (!v) return "Confirme su contraseña";
    if (v !== fields.password) return "Las contraseñas no coinciden";
    return "";
  },
};

const getError = (field, fields) => {
  const value = fields[field];
  const rule = rules[field];
  if (!rule) return "";
  return field === "confirm_password" ? rule(value, fields) : rule(value);
};

const getPwStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  return strength;
};

const getPwBarColor = (strength) => {
  if (strength === 0) return "#d9d9d9";
  if (strength === 1) return "#ff8a65";
  if (strength === 2) return "#f4c542";
  return "#67c26f";
};

const CustomField = ({ icon: Icon, error, right, children, isSelect = false }) => {
  return (
    <div className={`registro-field ${error ? "registro-field--error" : ""}`}>
      <div
        className={`registro-field__control ${
          isSelect ? "registro-field__control--select" : ""
        }`}
      >
        {Icon && <Icon className="registro-field__icon" />}
        {children}
        {right && <div className="registro-field__right">{right}</div>}
      </div>
      {error && <div className="registro-field-error">{error}</div>}
    </div>
  );
};

const RegistroPage = () => {
  const [type, setType] = useState("cliente");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const [fields, setFields] = useState({
    "c-nombre": "",
    "c-apellido": "",
    "c-email": "",
    "c-telefono": "",
    "c-direccion": "",
    "c-metodo_pago": "",
    "e-nombre_empresa": "",
    "e-email_contacto": "",
    "e-telefono": "",
    "e-nombre": "",
    "e-apellido": "",
    "e-email": "",
    password: "",
    confirm_password: "",
  });

  const setField = (id, value) => {
    setFields((prev) => ({ ...prev, [id]: value }));
    if (generalError) setGeneralError("");
  };

  const pwStrength = useMemo(() => getPwStrength(fields.password), [fields.password]);
  const pwBarColor = useMemo(() => getPwBarColor(pwStrength), [pwStrength]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const fieldsToValidate =
      type === "cliente"
        ? [
            "c-nombre",
            "c-apellido",
            "c-email",
            "c-telefono",
            "c-direccion",
            "c-metodo_pago",
            "password",
            "confirm_password",
          ]
        : [
            "e-nombre_empresa",
            "e-email_contacto",
            "e-telefono",
            "e-nombre",
            "e-apellido",
            "e-email",
            "password",
            "confirm_password",
          ];

    const hasError = fieldsToValidate.some((field) => getError(field, fields));

    if (hasError) {
      setGeneralError("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
    } catch (err) {
      setGeneralError("Ocurrió un error al registrar. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="registro-page">
        <Breadcrumb title="Registro exitoso" />

        <div className="it-signup-area pt-120 pb-120">
          <div className="container">
            <div className="it-signup-bg">
              <div className="row">
                <div className="col-xl-8 col-lg-10 mx-auto">
                  <div className="it-signup-wrap text-center">
                    <div className="registro-success-box">
                      <div className="success-icon">✓</div>
                      <h3>{type === "cliente" ? "¡Cuenta creada!" : "¡Empresa registrada!"}</h3>
                      <p>
                        {type === "cliente"
                          ? "Tu cuenta ya está lista para usar."
                          : "Tu empresa fue registrada con plan Free."}
                      </p>

                      <div className="success-tag">
                        {type === "cliente" ? "Tenant: 1" : "Plan: Free"}
                      </div>

                      <Link to="/sign-in" className="ed-btn-theme mt-4">
                        Ir a Iniciar Sesión
                        <RightArrow />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="registro-page">
      <Breadcrumb title="Registro" />

      <div className="it-signup-area pt-120 pb-120">
        <div className="container">
          <div className="it-signup-bg p-relative">
            <div className="row">
              <div className="col-xl-7 col-lg-8 mx-auto">
                <form onSubmit={handleSubmit} className="it-signup-wrap">
                  <h4 className="it-signup-title">
                    {type === "cliente" ? "Crear cuenta personal" : "Registrar empresa"}
                  </h4>

                  <div className="registro-type-switch">
                    <button
                      type="button"
                      className={type === "cliente" ? "active" : ""}
                      onClick={() => setType("cliente")}
                    >
                      Cliente
                    </button>
                    <button
                      type="button"
                      className={type === "empresa" ? "active" : ""}
                      onClick={() => setType("empresa")}
                    >
                      Empresa
                    </button>
                  </div>

                  <div className="registro-note">
                    <FiInfo />
                    <span>
                      {type === "cliente"
                        ? "El tenant se asigna automáticamente."
                        : "Se crea con tenant 1 y plan Free por defecto."}
                    </span>
                  </div>

                  {type === "cliente" && (
                    <>
                      <div className="registro-section-title">Información personal</div>
                      <div className="registro-row">
                        <CustomField icon={FiUser} error={getError("c-nombre", fields)}>
                          <input
                            type="text"
                            placeholder="Nombre *"
                            value={fields["c-nombre"]}
                            onChange={(e) => setField("c-nombre", e.target.value)}
                          />
                        </CustomField>

                        <CustomField icon={FiUser} error={getError("c-apellido", fields)}>
                          <input
                            type="text"
                            placeholder="Apellido *"
                            value={fields["c-apellido"]}
                            onChange={(e) => setField("c-apellido", e.target.value)}
                          />
                        </CustomField>
                      </div>

                      <div className="registro-section-title">Contacto</div>

                      <CustomField icon={FiMail} error={getError("c-email", fields)}>
                        <input
                          type="email"
                          placeholder="Correo electrónico *"
                          value={fields["c-email"]}
                          onChange={(e) => setField("c-email", e.target.value.toLowerCase())}
                        />
                      </CustomField>

                      <div className="registro-row">
                        <CustomField icon={FiPhone} error={getError("c-telefono", fields)}>
                          <input
                            type="text"
                            placeholder="Teléfono *"
                            value={fields["c-telefono"]}
                            onChange={(e) => setField("c-telefono", e.target.value)}
                          />
                        </CustomField>

                        <CustomField
                          icon={FiCreditCard}
                          error={getError("c-metodo_pago", fields)}
                          isSelect
                        >
                          <select
                            value={fields["c-metodo_pago"]}
                            onChange={(e) => setField("c-metodo_pago", e.target.value)}
                            required
                          >
                            {PAGO_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value} disabled={!o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </CustomField>
                      </div>

                      <CustomField icon={FiMapPin} error={getError("c-direccion", fields)}>
                        <input
                          type="text"
                          placeholder="Dirección *"
                          value={fields["c-direccion"]}
                          onChange={(e) => setField("c-direccion", e.target.value)}
                        />
                      </CustomField>
                    </>
                  )}

                  {type === "empresa" && (
                    <>
                      <div className="registro-section-title">Datos de la empresa</div>

                      <CustomField icon={FiHome} error={getError("e-nombre_empresa", fields)}>
                        <input
                          type="text"
                          placeholder="Nombre de la empresa *"
                          value={fields["e-nombre_empresa"]}
                          onChange={(e) => setField("e-nombre_empresa", e.target.value)}
                        />
                      </CustomField>

                      <div className="registro-row">
                        <CustomField icon={FiMail} error={getError("e-email_contacto", fields)}>
                          <input
                            type="email"
                            placeholder="Email de contacto *"
                            value={fields["e-email_contacto"]}
                            onChange={(e) => setField("e-email_contacto", e.target.value.toLowerCase())}
                          />
                        </CustomField>

                        <CustomField icon={FiPhone} error={getError("e-telefono", fields)}>
                          <input
                            type="text"
                            placeholder="Teléfono *"
                            value={fields["e-telefono"]}
                            onChange={(e) => setField("e-telefono", e.target.value)}
                          />
                        </CustomField>
                      </div>

                      <div className="registro-section-title">Administrador</div>

                      <div className="registro-row">
                        <CustomField icon={FiUser} error={getError("e-nombre", fields)}>
                          <input
                            type="text"
                            placeholder="Nombre *"
                            value={fields["e-nombre"]}
                            onChange={(e) => setField("e-nombre", e.target.value)}
                          />
                        </CustomField>

                        <CustomField icon={FiUser} error={getError("e-apellido", fields)}>
                          <input
                            type="text"
                            placeholder="Apellido *"
                            value={fields["e-apellido"]}
                            onChange={(e) => setField("e-apellido", e.target.value)}
                          />
                        </CustomField>
                      </div>

                      <CustomField icon={FiMail} error={getError("e-email", fields)}>
                        <input
                          type="email"
                          placeholder="Email del administrador *"
                          value={fields["e-email"]}
                          onChange={(e) => setField("e-email", e.target.value.toLowerCase())}
                        />
                      </CustomField>
                    </>
                  )}

                  <div className="registro-section-title">Seguridad</div>

                  <div className="registro-row">
                    <div>
                      <CustomField
                        icon={FiLock}
                        error={getError("password", fields)}
                        right={
                          <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPw(!showPw)}
                          >
                            {showPw ? <FiEyeOff /> : <FiEye />}
                          </button>
                        }
                      >
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder="Contraseña *"
                          value={fields.password}
                          onChange={(e) => setField("password", e.target.value)}
                        />
                      </CustomField>

                      <div className="registro-password-bar">
                        <span
                          style={{
                            width: `${pwStrength * 33.33}%`,
                            background: pwBarColor,
                          }}
                        />
                      </div>

                      <div className="registro-password-help">
                        Mínimo 8 caracteres, 1 mayúscula y 1 número
                      </div>
                    </div>

                    <div>
                      <CustomField
                        icon={FiLock}
                        error={getError("confirm_password", fields)}
                        right={
                          <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowConfirm(!showConfirm)}
                          >
                            {showConfirm ? <FiEyeOff /> : <FiEye />}
                          </button>
                        }
                      >
                        <input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Confirmar contraseña *"
                          value={fields.confirm_password}
                          onChange={(e) => setField("confirm_password", e.target.value)}
                        />
                      </CustomField>
                    </div>
                  </div>

                  {generalError && (
                    <div className="registro-general-error">{generalError}</div>
                  )}

                  <div className="it-signup-btn d-flex justify-content-center mt-4">
                    <button type="submit" className="ed-btn-theme" disabled={loading}>
                      {loading ? "Registrando..." : "Crear cuenta"}
                      <RightArrow />
                    </button>
                  </div>

                  <div className="it-signup-text text-center mt-4">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/sign-in">
                      <strong>Inicia sesión</strong>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegistroPage;