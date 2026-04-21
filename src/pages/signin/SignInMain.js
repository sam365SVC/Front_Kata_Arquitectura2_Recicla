import React, { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiMail, FiShield } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";

import signInImg from "../../assets/img/contact/signin1.png";
import { loginUser } from "./slices/loginThunks";
import { clearError, clearTenantSelection } from "./slices/loginSlice";
import {
  selectIsLoading,
  selectError,
  selectUser,
  selectIsAuthenticated,
  selectNeedsTenantSelection,
  selectTenantOptions,
  selectPendingCredentials,
} from "./slices/loginSelectors";
import { getRedirectByRole } from "../../utils/authRedirect";

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

const SignInMain = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const needsTenantSelection = useSelector(selectNeedsTenantSelection);
  const tenantOptions = useSelector(selectTenantOptions);
  const pendingCredentials = useSelector(selectPendingCredentials);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailError = useMemo(() => {
    if (!submitted && !email) return "";
    if (!email.trim()) return "El correo es obligatorio.";
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return "Ingresa un correo electrónico válido.";
    }
    return "";
  }, [email, submitted]);

  const passwordError = useMemo(() => {
    if (!submitted && !password) return "";
    if (!password.trim()) return "La contraseña es obligatoria.";
    if (password.length < 8) {
      return "Debe tener al menos 8 caracteres.";
    }
    if (!passwordHasUppercase.test(password)) {
      return "Debe incluir una letra mayúscula.";
    }
    if (!passwordHasNumber.test(password)) {
      return "Debe incluir un número.";
    }
    return "";
  }, [password, submitted]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: error,
        confirmButtonColor: COLORS.olive,
        background: "#fffef8",
        color: COLORS.text,
      });
    }
  }, [error]);

  useEffect(() => {
    if (!isAuthenticated || !user?.token || !user?.id) return;

    const redirect = getRedirectByRole(user.rol);
    navigate(redirect, { replace: true });
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!needsTenantSelection || !tenantOptions?.length) return;
    setSelectedTenant(String(tenantOptions[0]?.tenant_id ?? ""));
  }, [needsTenantSelection, tenantOptions]);

  const validateForm = () => {
    setSubmitted(true);
    return !emailError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (error) dispatch(clearError());

    if (!validateForm()) {
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

    const result = await dispatch(
      loginUser({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })
    );

    if (result.meta.requestStatus === "fulfilled" && !result.payload?.needsTenantSelection) {
      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: "Inicio de sesión correcto.",
        timer: 1200,
        showConfirmButton: false,
        background: "#fffef8",
        color: COLORS.text,
      });
    }
  };

  const handleTenantLogin = async () => {
    if (!pendingCredentials?.email || !pendingCredentials?.password) {
      Swal.fire({
        icon: "error",
        title: "No se pudo continuar",
        text: "No se encontraron las credenciales para completar el acceso.",
        confirmButtonColor: COLORS.olive,
        background: "#fffef8",
        color: COLORS.text,
      });
      return;
    }

    if (!selectedTenant) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un tenant",
        text: "Debes elegir uno para continuar.",
        confirmButtonColor: COLORS.olive,
        background: "#fffef8",
        color: COLORS.text,
      });
      return;
    }

    const result = await dispatch(
      loginUser({
        email: pendingCredentials.email,
        password: pendingCredentials.password,
        tenant_id: Number(selectedTenant),
      })
    );

    if (result.meta.requestStatus === "fulfilled" && !result.payload?.needsTenantSelection) {
      dispatch(clearTenantSelection());

      Swal.fire({
        icon: "success",
        title: "Acceso confirmado",
        text: "Tenant seleccionado correctamente.",
        timer: 1200,
        showConfirmButton: false,
        background: "#fffef8",
        color: COLORS.text,
      });
    }
  };

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
                        Iniciar sesión
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
                        Accede a tu panel y gestiona tus procesos dentro de
                        Reecicla de forma segura.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
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
                          Correo electrónico
                        </label>

                        <div style={{ position: "relative" }}>
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

                          <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value.toLowerCase());
                              if (error) dispatch(clearError());
                            }}
                            style={{
                              width: "100%",
                              height: "56px",
                              borderRadius: "14px",
                              border: `1px solid ${
                                emailError ? COLORS.error : COLORS.oliveBorder
                              }`,
                              background: "#fff",
                              padding: "0 16px 0 44px",
                              outline: "none",
                              fontSize: "15px",
                            }}
                          />
                        </div>

                        {emailError && (
                          <div
                            style={{
                              marginTop: "8px",
                              color: COLORS.error,
                              fontSize: "13px",
                            }}
                          >
                            {emailError}
                          </div>
                        )}
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: COLORS.text,
                            marginBottom: "8px",
                          }}
                        >
                          Contraseña
                        </label>

                        <div style={{ position: "relative" }}>
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

                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (error) dispatch(clearError());
                            }}
                            style={{
                              width: "100%",
                              height: "56px",
                              borderRadius: "14px",
                              border: `1px solid ${
                                passwordError ? COLORS.error : COLORS.oliveBorder
                              }`,
                              background: "#fff",
                              padding: "0 48px 0 44px",
                              outline: "none",
                              fontSize: "15px",
                            }}
                          />

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
                        </div>

                        {passwordError && (
                          <div
                            style={{
                              marginTop: "8px",
                              color: COLORS.error,
                              fontSize: "13px",
                            }}
                          >
                            {passwordError}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          marginBottom: "22px",
                          padding: "14px 16px",
                          borderRadius: "12px",
                          
                          
                        }}
                      >
                       
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          width: "100%",
                          height: "58px",
                          borderRadius: "16px",
                          border: "none",
                          background: isLoading
                            ? "#9da065"
                            : "linear-gradient(135deg, #7c8140 0%, #676b33 100%)",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: 700,
                          cursor: isLoading ? "not-allowed" : "pointer",
                          boxShadow: "0 12px 24px rgba(120, 121, 63, 0.22)",
                          transition: "all 0.25s ease",
                        }}
                      >
                        {isLoading ? "Ingresando..." : "Iniciar sesión"}
                      </button>

                      {needsTenantSelection && tenantOptions?.length > 0 && (
                        <div
                          style={{
                            marginTop: "22px",
                            padding: "18px",
                            borderRadius: "16px",
                            background: "#fffef8",
                            border: "1px solid rgba(120, 121, 63, 0.18)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              color: COLORS.olive,
                              marginBottom: "10px",
                              fontSize: "15px",
                            }}
                          >
                            Selecciona un tenant para continuar
                          </div>

                          <select
                            value={selectedTenant}
                            onChange={(e) => setSelectedTenant(e.target.value)}
                            style={{
                              width: "100%",
                              height: "52px",
                              borderRadius: "12px",
                              border: `1px solid ${COLORS.oliveBorder}`,
                              padding: "0 14px",
                              marginBottom: "14px",
                              background: "#fff",
                              fontSize: "14px",
                            }}
                          >
                            {tenantOptions.map((tenant) => (
                              <option
                                key={tenant.tenant_id}
                                value={tenant.tenant_id}
                              >
                                {tenant.nombre} - {tenant.rol}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={handleTenantLogin}
                            disabled={isLoading}
                            style={{
                              width: "100%",
                              height: "52px",
                              borderRadius: "12px",
                              border: `1px solid ${COLORS.olive}`,
                              background: COLORS.oliveSoft,
                              color: COLORS.olive,
                              fontWeight: 700,
                              cursor: isLoading ? "not-allowed" : "pointer",
                            }}
                          >
                            Continuar con tenant
                          </button>
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: "22px",
                          textAlign: "center",
                          fontSize: "15px",
                          color: "#555",
                        }}
                      >
                        ¿No tienes una cuenta?{" "}
                        <Link
                          to="/registro"
                          style={{
                            color: COLORS.olive,
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          Regístrate
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
                      minHeight: "720px",
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
                        Gestiona cotizaciones, operaciones logísticas e
                        inspecciones en una sola experiencia.
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

export default SignInMain;