import React, { useMemo, useState, useEffect } from "react";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
  FiPhone,
  FiMapPin,
  FiHome,
  FiInfo,
  FiShield,
  FiBriefcase
} from "react-icons/fi";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import signInImg from "../../assets/img/contact/signin1.png";

import { useDispatch, useSelector } from "react-redux";
import {
  registrarClienteThunk,
  registrarTenantThunk,
  fetchTenantsDisponibles
} from "./registroSlices/RegistroThunk";
import { clearRegistroState } from "./registroSlices/RegistroSlice";
import {

  selectRegistroLoading,

  selectRegistroError,

  selectTenantsDisponibles,

  selectTenantsDisponiblesLoading,

} from "./registroSlices/RegistroSelectors";



const COLORS = {
  olive: "#78793F",
  oliveSoft: "#F3F0D7",
  oliveBorder: "#D7D1A5",
  text: "#2F2F2F",
  bg: "#FAF9F2",
  error: "#C0392B",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordHasUppercase = /[A-Z]/;
const passwordHasNumber = /\d/;

const cardShadow = "0 20px 50px rgba(73, 80, 21, 0.10)";

const RegistroMain = () => {

  
  const [tipoRegistro, setTipoRegistro] = useState("cliente");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  const dispatch = useDispatch();

  const registroLoading = useSelector((state) => state.registro.registroLoading);
  const registroError = useSelector((state) => state.registro.error);
  const registroSuccess = useSelector((state) => state.registro.success);

  const tenantsDisponibles = useSelector(selectTenantsDisponibles);
  const tenantsLoading = useSelector(selectTenantsDisponiblesLoading);

 useEffect(() => {
  console.log("DISPARANDO FETCH TENANTS");
  dispatch(fetchTenantsDisponibles({ page: 1, limit: 10 }));
}, [dispatch]);
    console.log("tenantsDisponibles:", tenantsDisponibles);
    console.log("tenantsLoading:", tenantsLoading);

    const fullState = useSelector((state) => state);
console.log("CLAVES DEL STATE:", Object.keys(fullState));
const registroState = useSelector((state) => state.registro);
console.log("REGISTRO STATE:", registroState);
   

console.log("TENANTS DESDE REGISTRO ITEMS:", registroState?.items);


  const [clienteData, setClienteData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
    tenant_id: "", // ID de tenant fijo para clientes registrados desde esta página
  });

  const [empresaData, setEmpresaData] = useState({
    nombreEmpresa: "",
    emailContacto: "",
    telefonoEmpresa: "",
    adminNombre: "",
    adminApellido: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
     // ID de tenant fijo para empresas registradas desde esta página
  });

  useEffect(() => {
    if (!clienteData.tenant_id && tenantsDisponibles.length > 0) {
      setClienteData((prev) => ({
        ...prev,
        tenant_id: tenantsDisponibles[0].id,
      }));
    }
  }, [tenantsDisponibles, clienteData.tenant_id]);

  useEffect(() => {
  console.log("disparando fetchTenantsDisponibles...");
  dispatch(fetchTenantsDisponibles({ page: 1, limit: 10 }));
}, [dispatch]);

  const currentData = tipoRegistro === "cliente" ? clienteData : empresaData;

  const updateField = (field, value) => {
    if (tipoRegistro === "cliente") {
      setClienteData((prev) => ({ ...prev, [field]: value }));
    } else {
      setEmpresaData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const getFieldValue = (field) => currentData[field] || "";

  const errors = useMemo(() => {
    if (!submitted) return {};

    if (tipoRegistro === "cliente") {
      return {
        nombre: !clienteData.nombre.trim() ? "El nombre es obligatorio." : "",
        apellido: !clienteData.apellido.trim() ? "El apellido es obligatorio." : "",
        email: !clienteData.email.trim()
          ? "El correo es obligatorio."
          : !emailRegex.test(clienteData.email.trim().toLowerCase())
          ? "Ingresa un correo electrónico válido."
          : "",
        telefono: !clienteData.telefono.trim() ? "El teléfono es obligatorio." : "",
        direccion: !clienteData.direccion.trim() ? "La dirección es obligatoria." : "",
        password: !clienteData.password.trim()
          ? "La contraseña es obligatoria."
          : clienteData.password.length < 8
          ? "Debe tener al menos 8 caracteres."
          : !passwordHasUppercase.test(clienteData.password)
          ? "Debe incluir una letra mayúscula."
          : !passwordHasNumber.test(clienteData.password)
          ? "Debe incluir un número."
          : "",
        confirmPassword: !clienteData.confirmPassword.trim()
          ? "Confirma tu contraseña."
          : clienteData.confirmPassword !== clienteData.password
          ? "Las contraseñas no coinciden."
          : "",
      };
    }

    return {
      nombreEmpresa: !empresaData.nombreEmpresa.trim()
        ? "El nombre de la empresa es obligatorio."
        : "",
      emailContacto: !empresaData.emailContacto.trim()
        ? "El email de contacto es obligatorio."
        : !emailRegex.test(empresaData.emailContacto.trim().toLowerCase())
        ? "Ingresa un correo electrónico válido."
        : "",
      telefonoEmpresa: !empresaData.telefonoEmpresa.trim()
        ? "El teléfono es obligatorio."
        : "",
      adminNombre: !empresaData.adminNombre.trim()
        ? "El nombre del administrador es obligatorio."
        : "",
      adminApellido: !empresaData.adminApellido.trim()
        ? "El apellido del administrador es obligatorio."
        : "",
      adminEmail: !empresaData.adminEmail.trim()
        ? "El email del administrador es obligatorio."
        : !emailRegex.test(empresaData.adminEmail.trim().toLowerCase())
        ? "Ingresa un correo electrónico válido."
        : "",
      password: !empresaData.password.trim()
        ? "La contraseña es obligatoria."
        : empresaData.password.length < 8
        ? "Debe tener al menos 8 caracteres."
        : !passwordHasUppercase.test(empresaData.password)
        ? "Debe incluir una letra mayúscula."
        : !passwordHasNumber.test(empresaData.password)
        ? "Debe incluir un número."
        : "",
      confirmPassword: !empresaData.confirmPassword.trim()
        ? "Confirma tu contraseña."
        : empresaData.confirmPassword !== empresaData.password
        ? "Las contraseñas no coinciden."
        : "",
    };
  }, [submitted, tipoRegistro, clienteData, empresaData]);

  const hasErrors = Object.values(errors).some(Boolean);

  const passwordValue = getFieldValue("password");
  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (passwordValue.length >= 8) strength++;
    if (passwordHasUppercase.test(passwordValue)) strength++;
    if (passwordHasNumber.test(passwordValue)) strength++;
    return strength;
  }, [passwordValue]);

  const passwordBarColor = useMemo(() => {
    if (passwordStrength === 0) return "#E5E7EB";
    if (passwordStrength === 1) return "#F59E0B";
    if (passwordStrength === 2) return "#84CC16";
    return "#22C55E";
  }, [passwordStrength]);

  const validateForm = () => {
    setSubmitted(true);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setSubmitted(true);

  const localErrors =
    tipoRegistro === "cliente"
      ? {
          nombre: !clienteData.nombre.trim(),
          apellido: !clienteData.apellido.trim(),
          email:
            !clienteData.email.trim() ||
            !emailRegex.test(clienteData.email.trim().toLowerCase()),
          telefono: !clienteData.telefono.trim(),
          direccion: !clienteData.direccion.trim(),
          password:
            !clienteData.password.trim() ||
            clienteData.password.length < 8 ||
            !passwordHasUppercase.test(clienteData.password) ||
            !passwordHasNumber.test(clienteData.password),
          confirmPassword:
            !clienteData.confirmPassword.trim() ||
            clienteData.confirmPassword !== clienteData.password,
          tenant_id: !clienteData.tenant_id,
        }
      : {
          nombreEmpresa: !empresaData.nombreEmpresa.trim(),
          emailContacto:
            !empresaData.emailContacto.trim() ||
            !emailRegex.test(empresaData.emailContacto.trim().toLowerCase()),
          telefonoEmpresa: !empresaData.telefonoEmpresa.trim(),
          adminNombre: !empresaData.adminNombre.trim(),
          adminApellido: !empresaData.adminApellido.trim(),
          adminEmail:
            !empresaData.adminEmail.trim() ||
            !emailRegex.test(empresaData.adminEmail.trim().toLowerCase()),
          password:
            !empresaData.password.trim() ||
            empresaData.password.length < 8 ||
            !passwordHasUppercase.test(empresaData.password) ||
            !passwordHasNumber.test(empresaData.password),
          confirmPassword:
            !empresaData.confirmPassword.trim() ||
            empresaData.confirmPassword !== empresaData.password,
        };

  const invalid = Object.values(localErrors).some(Boolean);

  if (invalid) {
    Swal.fire({
      icon: "warning",
      title: "Revisa los datos",
      text: "Corrige los campos antes de continuar.",
      confirmButtonColor: COLORS.olive,
      background: "#fffef8",
      color: COLORS.text,
    });
    return;
  }

  let resultAction;

  if (tipoRegistro === "cliente") {
    resultAction = await dispatch(
      registrarClienteThunk({
        nombre: clienteData.nombre,
        apellido: clienteData.apellido,
        email: clienteData.email,
        telefono: clienteData.telefono,
        direccion: clienteData.direccion,
        password: clienteData.password,
        tenant_id: Number(clienteData.tenant_id), // ID de tenant fijo para clientes registrados desde esta página
      })
    );
  } else {
    resultAction = await dispatch(
      registrarTenantThunk({
        nombre_empresa: empresaData.nombreEmpresa,
        email_contacto: empresaData.emailContacto,
        telefono: empresaData.telefonoEmpresa,
        nombre: empresaData.adminNombre,
        apellido: empresaData.adminApellido,
        email: empresaData.adminEmail,
        password: empresaData.password,
      })
    );
  }

  if (
    registrarClienteThunk.fulfilled.match(resultAction) ||
    registrarTenantThunk.fulfilled.match(resultAction)
  ) {
    Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text:
        tipoRegistro === "cliente"
          ? "Tu cuenta fue creada correctamente."
          : "La empresa fue registrada correctamente.",
      confirmButtonColor: COLORS.olive,
      background: "#fffef8",
      color: COLORS.text,
    });

    dispatch(clearRegistroState());

    if (tipoRegistro === "cliente") {
      setClienteData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
      });
    } else {
      setEmpresaData({
        nombreEmpresa: "",
        emailContacto: "",
        telefonoEmpresa: "",
        adminNombre: "",
        adminApellido: "",
        adminEmail: "",
        password: "",
        confirmPassword: "",
      });
    }

    setSubmitted(false);
  } else {
    Swal.fire({
      icon: "error",
      title: "No se pudo completar el registro",
      text:
        resultAction.payload ||
        "Intenta nuevamente en unos momentos.",
      confirmButtonColor: COLORS.olive,
      background: "#fffef8",
      color: COLORS.text,
    });
  }
};

  const renderInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  icon,
  rightButton,
  options = [],
}) => (
  <div style={{ marginBottom: "18px" }}>
    <label
      style={{
        display: "block",
        fontSize: "14px",
        fontWeight: 700,
        color: COLORS.text,
        marginBottom: "8px",
      }}
    >
      {label}
    </label>

    <div style={{ position: "relative" }}>
      {icon}

      {type === "select" ? (
        <>
          <select
            value={value}
            onChange={onChange}
            style={{
              width: "100%",
              height: "56px",
              borderRadius: "14px",
              border: `1px solid ${error ? COLORS.error : COLORS.oliveBorder}`,
              background: "#fff",
              color: value ? COLORS.text : "#8a8a8a",
              padding: "0 46px 0 44px",
              outline: "none",
              fontSize: "15px",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              cursor: "pointer",
              lineHeight: "56px",
            }}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <span
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: COLORS.olive,
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            ▼
          </span>
        </>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            height: "56px",
            borderRadius: "14px",
            border: `1px solid ${error ? COLORS.error : COLORS.oliveBorder}`,
            background: "#fff",
            color: COLORS.text,
            padding: `0 ${rightButton ? "48px" : "16px"} 0 44px`,
            outline: "none",
            fontSize: "15px",
          }}
        />
      )}

      {rightButton}
    </div>

    {error && (
      <div
        style={{
          marginTop: "8px",
          color: COLORS.error,
          fontSize: "13px",
        }}
      >
        {error}
      </div>
    )}
  </div>
);

  return (
    <main
      style={{
        background: "linear-gradient(180deg, #fcfbf5 0%, #f8f6ea 100%)",
        minHeight: "100vh",
        padding: "40px 0 90px",
      }}
    >
      <div className="container">
        <div className="row align-items-center g-0">
          <div className="col-xl-11 col-lg-12 mx-auto">
            <div
              style={{
                background: "#fffdf6",
                borderRadius: "26px",
                overflow: "hidden",
                boxShadow: cardShadow,
                border: "1px solid rgba(120, 121, 63, 0.12)",
              }}
            >
              <div className="row g-0">
                <div className="col-lg-6">
                  <div
                    style={{
                      padding: "clamp(28px, 4vw, 56px)",
                      minHeight: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ marginBottom: "28px" }}>
                      <h2
                        style={{
                          fontSize: "clamp(30px, 4vw, 46px)",
                          lineHeight: 1.05,
                          marginBottom: "12px",
                          color: "#111",
                          fontWeight: 800,
                          letterSpacing: "-0.5px",
                        }}
                      >
                        Crear cuenta
                      </h2>

                      <p
                        style={{
                          fontSize: "16px",
                          color: "#666",
                          marginBottom: 0,
                          lineHeight: 1.65,
                          maxWidth: "520px",
                        }}
                      >
                        Regístrate en Reecicla y comienza a gestionar tus
                        procesos de forma simple y segura.
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "22px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setTipoRegistro("cliente")}
                        style={{
                          flex: 1,
                          height: "48px",
                          borderRadius: "12px",
                          border:
                            tipoRegistro === "cliente"
                              ? `1px solid ${COLORS.olive}`
                              : `1px solid ${COLORS.oliveBorder}`,
                          background:
                            tipoRegistro === "cliente"
                              ? COLORS.oliveSoft
                              : "#fff",
                          color:
                            tipoRegistro === "cliente"
                              ? COLORS.olive
                              : COLORS.text,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Cliente
                      </button>

                      <button
                        type="button"
                        onClick={() => setTipoRegistro("empresa")}
                        style={{
                          flex: 1,
                          height: "48px",
                          borderRadius: "12px",
                          border:
                            tipoRegistro === "empresa"
                              ? `1px solid ${COLORS.olive}`
                              : `1px solid ${COLORS.oliveBorder}`,
                          background:
                            tipoRegistro === "empresa"
                              ? COLORS.oliveSoft
                              : "#fff",
                          color:
                            tipoRegistro === "empresa"
                              ? COLORS.olive
                              : COLORS.text,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Empresa
                      </button>
                    </div>

                    <div
                      style={{
                        marginBottom: "22px",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: "#fffef8",
                        border: "1px solid rgba(120, 121, 63, 0.18)",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                      }}
                    >
                      <FiInfo
                        style={{
                          color: COLORS.olive,
                          marginTop: "2px",
                          fontSize: "16px",
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          color: "#555",
                          fontSize: "14px",
                          lineHeight: 1.55,
                        }}
                      >
                        {tipoRegistro === "cliente"
                          ? "Tu cuenta se registrará como cliente de GatoByte de manera determinada."
                          : "La empresa se registrará con el plan Free por defecto."}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                      {tipoRegistro === "cliente" ? (
                        <>
                          {renderInput({
                            label: "Nombre",
                            value: clienteData.nombre,
                            onChange: (e) => updateField("nombre", e.target.value),
                            placeholder: "Tu nombre",
                            error: errors.nombre,
                            icon: (
                              <FiUser
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Apellido",
                            value: clienteData.apellido,
                            onChange: (e) => updateField("apellido", e.target.value),
                            placeholder: "Tu apellido",
                            error: errors.apellido,
                            icon: (
                              <FiUser
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Correo electrónico",
                            value: clienteData.email,
                            onChange: (e) =>
                              updateField("email", e.target.value.toLowerCase()),
                            placeholder: "ejemplo@correo.com",
                            type: "email",
                            error: errors.email,
                            icon: (
                              <FiMail
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Teléfono",
                            value: clienteData.telefono,
                            onChange: (e) => updateField("telefono", e.target.value),
                            placeholder: "+591 70000000",
                            error: errors.telefono,
                            icon: (
                              <FiPhone
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Dirección",
                            value: clienteData.direccion,
                            onChange: (e) => updateField("direccion", e.target.value),
                            placeholder: "Tu dirección",
                            error: errors.direccion,
                            icon: (
                              <FiMapPin
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}
                           {renderInput({
                            label: "Empresa a la que quiere registrarse",
                            value: clienteData.tenant_id,
                            onChange: (e) => updateField("tenant_id", e.target.value),
                            error: errors.tenant_id,
                            type: "select",
                            options: [
                              { value: "", label: "Selecciona una empresa *" },
                              ...tenantsDisponibles
                                .filter((t) => !t.yaPertenece)
                                .map((t) => ({
                                  value: t.id,
                                  label: `${t.nombre} — ${t.plan}`,
                                })),
                            ],
                            icon: (
                              <FiBriefcase
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                  zIndex: 2,
                                }}
                              />
                            ),
                          })}
                        </>
                      ) : (
                        <>
                          {renderInput({
                            label: "Nombre de la empresa",
                            value: empresaData.nombreEmpresa,
                            onChange: (e) =>
                              updateField("nombreEmpresa", e.target.value),
                            placeholder: "Nombre legal o comercial",
                            error: errors.nombreEmpresa,
                            icon: (
                              <FiHome
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Correo de contacto",
                            value: empresaData.emailContacto,
                            onChange: (e) =>
                              updateField("emailContacto", e.target.value.toLowerCase()),
                            placeholder: "empresa@correo.com",
                            type: "email",
                            error: errors.emailContacto,
                            icon: (
                              <FiMail
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Teléfono de la empresa",
                            value: empresaData.telefonoEmpresa,
                            onChange: (e) =>
                              updateField("telefonoEmpresa", e.target.value),
                            placeholder: "+591 70000000",
                            error: errors.telefonoEmpresa,
                            icon: (
                              <FiPhone
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Nombre del administrador",
                            value: empresaData.adminNombre,
                            onChange: (e) =>
                              updateField("adminNombre", e.target.value),
                            placeholder: "Nombre",
                            error: errors.adminNombre,
                            icon: (
                              <FiShield
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Apellido del administrador",
                            value: empresaData.adminApellido,
                            onChange: (e) =>
                              updateField("adminApellido", e.target.value),
                            placeholder: "Apellido",
                            error: errors.adminApellido,
                            icon: (
                              <FiShield
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}

                          {renderInput({
                            label: "Correo del administrador",
                            value: empresaData.adminEmail,
                            onChange: (e) =>
                              updateField("adminEmail", e.target.value.toLowerCase()),
                            placeholder: "admin@empresa.com",
                            type: "email",
                            error: errors.adminEmail,
                            icon: (
                              <FiMail
                                style={{
                                  position: "absolute",
                                  left: 14,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: COLORS.olive,
                                  fontSize: "18px",
                                }}
                              />
                            ),
                          })}
                        </>
                      )}

                      {renderInput({
                        label: "Contraseña",
                        value: getFieldValue("password"),
                        onChange: (e) => updateField("password", e.target.value),
                        placeholder: "Crea una contraseña",
                        type: showPassword ? "text" : "password",
                        error: errors.password,
                        icon: (
                          <FiLock
                            style={{
                              position: "absolute",
                              left: 14,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: COLORS.olive,
                              fontSize: "18px",
                            }}
                          />
                        ),
                        rightButton: (
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              border: "none",
                              background: "transparent",
                              color: COLORS.olive,
                              cursor: "pointer",
                              fontSize: "18px",
                              padding: 0,
                            }}
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        ),
                      })}

                      <div
                        style={{
                          marginTop: "-8px",
                          marginBottom: "18px",
                          height: "6px",
                          width: "100%",
                          borderRadius: "999px",
                          background: "#E5E7EB",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(passwordStrength / 3) * 100}%`,
                            background: passwordBarColor,
                            transition: "all 0.25s ease",
                          }}
                        />
                      </div>

                      {renderInput({
                        label: "Confirmar contraseña",
                        value: getFieldValue("confirmPassword"),
                        onChange: (e) =>
                          updateField("confirmPassword", e.target.value),
                        placeholder: "Repite tu contraseña",
                        type: showConfirm ? "text" : "password",
                        error: errors.confirmPassword,
                        icon: (
                          <FiLock
                            style={{
                              position: "absolute",
                              left: 14,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: COLORS.olive,
                              fontSize: "18px",
                            }}
                          />
                        ),
                        rightButton: (
                          <button
                            type="button"
                            onClick={() => setShowConfirm((prev) => !prev)}
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              border: "none",
                              background: "transparent",
                              color: COLORS.olive,
                              cursor: "pointer",
                              fontSize: "18px",
                              padding: 0,
                            }}
                          >
                            {showConfirm ? <FiEyeOff /> : <FiEye />}
                          </button>
                        ),
                      })}

                      <button
                        type="submit"
                        disabled={registroLoading}
                        style={{
                          width: "100%",
                          height: "58px",
                          borderRadius: "16px",
                          border: "none",
                          background: registroLoading
                            ? "#9da065"
                            : "linear-gradient(135deg, #7c8140 0%, #676b33 100%)",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: 700,
                          cursor: registroLoading ? "not-allowed" : "pointer",
                          boxShadow: "0 12px 24px rgba(120, 121, 63, 0.22)",
                          transition: "all 0.25s ease",
                          marginTop: "10px",
                        }}
                      >
                        {registroLoading ? "Registrando..." : "Crear cuenta"}
                      </button>

                      <div
                        style={{
                          marginTop: "22px",
                          textAlign: "center",
                          fontSize: "15px",
                          color: "#555",
                        }}
                      >
                        ¿Ya tienes una cuenta?{" "}
                        <Link
                          to="/signin"
                          style={{
                            color: COLORS.olive,
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          Inicia sesión
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="col-lg-6 d-none d-lg-block">
                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      minHeight: "760px",
                      overflow: "hidden",
                      background: "#f2f0e2",
                    }}
                  >
                    <img
                      src={signInImg}
                      alt="Reecicla"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(20,20,20,0.10) 0%, rgba(20,20,20,0.30) 100%)",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        left: "36px",
                        right: "36px",
                        bottom: "34px",
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "20px",
                        padding: "22px 24px",
                        boxShadow: "0 16px 30px rgba(0,0,0,0.10)",
                      }}
                    >
                      <div
                        style={{
                          color: COLORS.olive,
                          fontWeight: 800,
                          fontSize: "13px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: "10px",
                        }}
                      >
                        Plataforma Reecicla
                      </div>

                      <div
                        style={{
                          color: "#111",
                          fontWeight: 800,
                          fontSize: "28px",
                          lineHeight: 1.2,
                          marginBottom: "10px",
                        }}
                      >
                        Tecnología que recicla.
                        <br />
                        Futuro que transforma.
                      </div>

                      <p
                        style={{
                          color: "#5d5d5d",
                          fontSize: "15px",
                          lineHeight: 1.65,
                          marginBottom: 0,
                        }}
                      >
                        Registra tu cuenta y empieza a usar una plataforma
                        centralizada para cotizaciones, inspecciones y logística.
                      </p>
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
};

export default RegistroMain;