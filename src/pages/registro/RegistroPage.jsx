import { useMemo, useState } from "react";
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
import signInImg from "../../assets/img/contact/signin1.png";
import "./Registro.scss";

const rules = {
  "c-nombre": (v) => (v.trim().length < 2 ? "Mínimo 2 caracteres" : ""),
  "c-apellido": (v) => (v.trim().length < 2 ? "Mínimo 2 caracteres" : ""),
  "c-email": (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Correo inválido",
  "c-telefono": (v) => {
    const c = v.replace(/\s/g, "");
    return !c
      ? "Requerido"
      : !/^\+?[0-9]{7,15}$/.test(c)
      ? "Formato: +591 71111111"
      : "";
  },
  "c-direccion": (v) => (v.trim().length < 5 ? "Mínimo 5 caracteres" : ""),
  "c-metodo_pago": (v) => (!v ? "Selecciona un método" : ""),
  "e-nombre_empresa": (v) =>
    v.trim().length < 2 ? "Mínimo 2 caracteres" : "",
  "e-email_contacto": (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Correo inválido",
  "e-telefono": (v) => {
    const c = v.replace(/\s/g, "");
    return !c
      ? "Requerido"
      : !/^\+?[0-9]{7,15}$/.test(c)
      ? "Formato: +591 70000000"
      : "";
  },
  "e-nombre": (v) => (v.trim().length < 2 ? "Mínimo 2 caracteres" : ""),
  "e-apellido": (v) => (v.trim().length < 2 ? "Mínimo 2 caracteres" : ""),
  "e-email": (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Correo inválido",
  password: (v) => {
    if (v.length < 8) return "Debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(v)) return "Debe incluir una mayúscula";
    if (!/[0-9]/.test(v)) return "Debe incluir un número";
    return "";
  },
  confirm_password: (v, fields) =>
    v !== fields.password ? "No coinciden" : "",
};

const PAGO_OPTIONS = [
  { value: "", label: "Selecciona un método" },
  { value: "tarjeta", label: "Tarjeta de crédito/débito" },
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "qr", label: "Pago por QR" },
];

function getPwStrength(v) {
  const checks = [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v)];
  return checks.filter(Boolean).length;
}

const RegistroPage = () => {
  const [type, setType] = useState("cliente");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({});
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

  const set = (id, value) => {
    setFields((prev) => ({ ...prev, [id]: value }));
    setTouched((prev) => ({ ...prev, [id]: true }));
    if (generalError) setGeneralError("");
  };

  const getError = (id) => {
    if (!touched[id]) return "";
    const rule = rules[id];
    if (!rule) return "";
    return id === "confirm_password"
      ? rule(fields[id], fields)
      : rule(fields[id]);
  };

  const activeFields = useMemo(
    () =>
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
          ],
    [type]
  );

  const pwStrength = getPwStrength(fields.password);
  const pwBarColor =
    pwStrength === 1
      ? "#c0392b"
      : pwStrength === 2
      ? "#d4a820"
      : pwStrength === 3
      ? "#5a8a3a"
      : "#e0e0d0";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTouched = {};
    activeFields.forEach((id) => {
      newTouched[id] = true;
    });
    setTouched((prev) => ({ ...prev, ...newTouched }));

    const hasErrors = activeFields.some((id) => {
      const rule = rules[id];
      if (!rule) return false;
      return id === "confirm_password"
        ? rule(fields[id], fields)
        : rule(fields[id]);
    });

    if (hasErrors) {
      setGeneralError("Revisa los campos marcados antes de continuar.");
      return;
    }

    setLoading(true);

    const payload =
      type === "cliente"
        ? {
            tenantId: 1,
            tipoCuenta: "cliente",
            nombre: fields["c-nombre"].trim(),
            apellido: fields["c-apellido"].trim(),
            email: fields["c-email"].trim(),
            telefono: fields["c-telefono"].trim(),
            direccion: fields["c-direccion"].trim(),
            metodoPagoPreferido: fields["c-metodo_pago"],
            password: fields.password,
          }
        : {
            tenantId: 1,
            tipoCuenta: "empresa",
            plan: "free",
            empresa: {
              nombre: fields["e-nombre_empresa"].trim(),
              emailContacto: fields["e-email_contacto"].trim(),
              telefono: fields["e-telefono"].trim(),
            },
            administrador: {
              nombre: fields["e-nombre"].trim(),
              apellido: fields["e-apellido"].trim(),
              email: fields["e-email"].trim(),
              password: fields.password,
            },
          };

    console.log("Payload listo para backend:", payload);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  const renderError = (id) =>
    getError(id) ? (
      <div className="registro-field-error">{getError(id)}</div>
    ) : null;

  if (success) {
    return (
      <main className="registro-page">
        <Breadcrumb title="Registro exitoso" />

        <div className="it-signup-area pt-120 pb-120">
          <div className="container">
            <div className="it-signup-bg p-relative">
              <div className="row">
                <div className="col-xl-8 col-lg-10 mx-auto">
                  <div className="it-signup-wrap">
                    <div className="registro-success-box">
                      <div className="success-icon">✓</div>

                      <h3>
                        {type === "cliente"
                          ? "¡Cuenta creada!"
                          : "¡Empresa registrada!"}
                      </h3>

                      <p>
                        {type === "cliente"
                          ? "Tu cuenta fue creada correctamente y ya está lista para usarse."
                          : "Tu empresa fue registrada correctamente con la configuración inicial predeterminada."}
                      </p>

                      <div className="success-tag">
                        {type === "cliente"
                          ? "Tenant asignado automáticamente: 1"
                          : "Plan inicial: Free"}
                      </div>

                      <div className="registro-note" style={{ maxWidth: 460, margin: "0 auto 24px" }}>
                        <FiInfo />
                        <span>
                          {type === "cliente"
                            ? "El tenant fue asignado automáticamente con valor 1."
                            : "La empresa fue creada con tenant 1 y plan inicial Free por defecto."}
                        </span>
                      </div>

                      <div className="it-signup-btn d-sm-flex justify-content-center align-items-center">
                        <Link to="/sign-in" className="ed-btn-theme">
                          Ir a iniciar sesión
                          <i>
                            <RightArrow />
                          </i>
                        </Link>
                      </div>
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
            <div className="it-signup-thumb d-none d-lg-block">
              <img src={signInImg} alt="Registro" />
            </div>

            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <form onSubmit={handleSubmit}>
                  <div className="it-signup-wrap">
                    <h4 className="it-signup-title">
                      {type === "cliente"
                        ? "Crear cuenta"
                        : "Registrar empresa"}
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
                          ? "El tenant se asigna automáticamente como 1."
                          : "La empresa se registra con tenant 1 y plan inicial Free por defecto."}
                      </span>
                    </div>

                    <div className="it-signup-input-wrap">
                      {type === "cliente" && (
                        <>
                          <div className="registro-section-title">
                            Información personal
                          </div>

                          <div className="registro-row">
                            <div className="it-signup-input" style={{ position: "relative" }}>
                              <FiUser
                                style={{
                                  position: "absolute",
                                  left: 16,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#78793F",
                                  zIndex: 2,
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Nombre *"
                                value={fields["c-nombre"]}
                                onChange={(e) => set("c-nombre", e.target.value)}
                              />
                              {renderError("c-nombre")}
                            </div>

                            <div className="it-signup-input" style={{ position: "relative" }}>
                              <FiUser
                                style={{
                                  position: "absolute",
                                  left: 16,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#78793F",
                                  zIndex: 2,
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Apellido *"
                                value={fields["c-apellido"]}
                                onChange={(e) => set("c-apellido", e.target.value)}
                              />
                              {renderError("c-apellido")}
                            </div>
                          </div>

                          <div className="registro-section-title">Contacto</div>

                          <div className="it-signup-input" style={{ position: "relative" }}>
                            <FiMail
                              style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#78793F",
                                zIndex: 2,
                              }}
                            />
                            <input
                              type="email"
                              placeholder="Correo Electrónico *"
                              value={fields["c-email"]}
                              onChange={(e) =>
                                set("c-email", e.target.value.toLowerCase())
                              }
                            />
                            {renderError("c-email")}
                          </div>

                          <div className="registro-row">
                            <div className="it-signup-input" style={{ position: "relative" }}>
                              <FiPhone
                                style={{
                                  position: "absolute",
                                  left: 16,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#78793F",
                                  zIndex: 2,
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Teléfono *"
                                value={fields["c-telefono"]}
                                onChange={(e) => set("c-telefono", e.target.value)}
                              />
                              {renderError("c-telefono")}
                            </div>

                            <div className="it-signup-input" style={{ position: "relative" }}>
                              <FiCreditCard
                                style={{

                                    position: "absolute",

                                    left: 16,

                                    top: "50%",

                                    transform: "translateY(-50%)",

                                    color: "#78793F",

                                    zIndex: 2,

                                    fontSize: "18px"

                                }}
                              />
                              <select
                                value={fields["c-metodo_pago"]}
                                onChange={(e) =>
                                  set("c-metodo_pago", e.target.value)
                                }
                              >
                                {PAGO_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                              {renderError("c-metodo_pago")}
                            </div>
                          </div>

                          <div className="it-signup-input" style={{ position: "relative" }}>
                            <FiMapPin
                              style={{

                                    position: "absolute",

                                    left: 16,

                                    top: "50%",

                                    transform: "translateY(-50%)",

                                    color: "#78793F",

                                    zIndex: 2,

                                    fontSize: "18px"

                                }}
                            />
                            <input
                              type="text"
                              placeholder="Dirección *"
                              value={fields["c-direccion"]}
                              onChange={(e) =>
                                set("c-direccion", e.target.value)
                              }
                            />
                            {renderError("c-direccion")}
                          </div>
                        </>
                      )}

                      {type === "empresa" && (
                        <>
                          <div className="registro-section-title">Empresa</div>

                          <div className="it-signup-input" style={{ position: "relative" }}>
                            <FiHome
                              style={{

                                    position: "absolute",

                                    left: 16,

                                    top: "50%",

                                    transform: "translateY(-50%)",

                                    color: "#78793F",

                                    zIndex: 2,

                                    fontSize: "18px"

                                }}
                            />
                            <input
                              type="text"
                              placeholder="Nombre de la empresa *"
                              value={fields["e-nombre_empresa"]}
                              onChange={(e) =>
                                set("e-nombre_empresa", e.target.value)
                              }
                            />
                            {renderError("e-nombre_empresa")}
                          </div>

                          <div className="registro-row">
                            <div className="it-signup-input" style={{ position: "relative" }}>
                              <FiMail
                                style={{

                                    position: "absolute",

                                    left: 16,

                                    top: "50%",

                                    transform: "translateY(-50%)",

                                    color: "#78793F",

                                    zIndex: 2,

                                    fontSize: "18px"

                                }}
                              />
                              <input
                                type="email"
                                placeholder="Email de contacto *"
                                value={fields["e-email_contacto"]}
                                onChange={(e) =>
                                  set(
                                    "e-email_contacto",
                                    e.target.value.toLowerCase()
                                  )
                                }
                              />
                              {renderError("e-email_contacto")}
                            </div>

                            <div className="it-signup-input" style={{ position: "relative" }}>
                              <FiPhone
                                style={{
                                  position: "absolute",
                                  left: 16,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#78793F",
                                  zIndex: 2,
                                  fontSize: "18px"
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Teléfono *"
                                value={fields["e-telefono"]}
                                onChange={(e) =>
                                  set("e-telefono", e.target.value)
                                }
                              />
                              {renderError("e-telefono")}
                            </div>
                          </div>

                          <div className="registro-section-title">
                            Administrador
                          </div>

                          <div className="registro-row">
                            <div className="it-signup-input" style={{ position: "relative" }}>
                              <FiUser
                                style={{
                                  position: "absolute",
                                  left: 16,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#78793F",
                                  zIndex: 2,
                                  fontSize: "18px"
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Nombre *"
                                value={fields["e-nombre"]}
                                onChange={(e) => set("e-nombre", e.target.value)}
                              />
                              {renderError("e-nombre")}
                            </div>

                            <div className="it-signup-input" style={{ position: "relative" }}>
                              <FiUser
                                style={{
                                  position: "absolute",
                                  left: 16,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#78793F",
                                  zIndex: 2,
                                  fontSize: "18px"
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Apellido *"
                                value={fields["e-apellido"]}
                                onChange={(e) =>
                                  set("e-apellido", e.target.value)
                                }
                              />
                              {renderError("e-apellido")}
                            </div>
                          </div>

                          <div className="it-signup-input" style={{ position: "relative" }}>
                            <FiMail
                              style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#78793F",
                                zIndex: 2,
                                fontSize: "18px"
                              }}
                            />
                            <input
                              type="email"
                              placeholder="Email del administrador *"
                              value={fields["e-email"]}
                              onChange={(e) =>
                                set("e-email", e.target.value.toLowerCase())
                              }
                            />
                            {renderError("e-email")}
                          </div>
                        </>
                      )}

                      <div className="registro-section-title">Seguridad</div>

                      <div className="registro-row">
                        <div>
                          <div className="it-signup-input" style={{ position: "relative" }}>
                            <FiLock
                              style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#78793F",
                                zIndex: 2,
                                fontSize: "18px"
                              }}
                            />
                            <input
                              type={showPw ? "text" : "password"}
                              placeholder="Contraseña *"
                              value={fields.password}
                              style={{ paddingRight: "46px" }}
                              onChange={(e) => set("password", e.target.value)}
                            />
                            <span
                              onClick={() => setShowPw(!showPw)}
                              style={{
                                position: "absolute",
                                right: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#78793F",
                                zIndex: 2,
                                fontSize: "18px"
                              }}
                            >
                              {showPw ? <FiEyeOff /> : <FiEye />}
                            </span>
                          </div>

                          <div className="registro-password-bar">
                            <span
                              style={{
                                width: `${pwStrength * 33.33}%`,
                                background: pwBarColor,
                              }}
                            />
                          </div>

                          <div className="registro-password-help">
                            Debe tener al menos 8 caracteres, una mayúscula y
                            un número.
                          </div>

                          {renderError("password")}
                        </div>

                        <div>
                          <div className="it-signup-input" style={{ position: "relative" }}>
                            <FiLock
                              style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#78793F",
                                zIndex: 2,
                                fontSize: "18px"
                              }}
                            />
                            <input
                              type={showConfirm ? "text" : "password"}
                              placeholder="Confirmar contraseña *"
                              value={fields.confirm_password}
                              style={{ paddingRight: "46px" }}
                              onChange={(e) =>
                                set("confirm_password", e.target.value)
                              }
                            />
                            <span
                              onClick={() => setShowConfirm(!showConfirm)}
                              style={{
                                position: "absolute",
                                right: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#78793F",
                                zIndex: 2,
                                fontSize: "18px"
                              }}
                            >
                              {showConfirm ? <FiEyeOff /> : <FiEye />}
                            </span>
                          </div>

                          {renderError("confirm_password")}
                        </div>
                      </div>
                    </div>

                    {generalError && (
                      <div className="registro-general-error">
                        {generalError}
                      </div>
                    )}

                    <div className="it-signup-btn d-sm-flex justify-content-between align-items-center mb-40">
                      <button
                        type="submit"
                        className="ed-btn-theme"
                        disabled={loading}
                      >
                        {loading ? "Registrando..." : "Crear cuenta"}
                        <i>
                          <RightArrow />
                        </i>
                      </button>
                    </div>

                    <div className="it-signup-text">
                      <span>
                        ¿Ya tienes cuenta? <Link to="/sign-in">Inicia sesión</Link>
                      </span>
                    </div>
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