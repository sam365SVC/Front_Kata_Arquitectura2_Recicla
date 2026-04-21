import React, { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiUserCheck } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

import { activarUsuarioEmpresaThunk } from "./empleadoSlices/RegistroEmpleadoThunk";
import { clearActivarEmpleadoState } from "./empleadoSlices/RegistroEmpleadoSlices";
import {
  selectActivarEmpleadoLoading,
  selectActivarEmpleadoError,
  selectActivarEmpleadoSuccess,
} from "./empleadoSlices/ActivarEmpleadoSelectors";

const COLORS = {
  olive: "#78793F",
  oliveBorder: "#D7D1A5",
  text: "#2F2F2F",
  error: "#C0392B",
};

const passwordHasUppercase = /[A-Z]/;
const passwordHasNumber = /\d/;

const RegistroEmpleadoMain = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const isLoading = useSelector(selectActivarEmpleadoLoading);
  const error = useSelector(selectActivarEmpleadoError);
  const success = useSelector(selectActivarEmpleadoSuccess);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const passwordError = useMemo(() => {
    if (!submitted && !password) return "";
    if (!password.trim()) return "La contraseña es obligatoria.";
    if (password.length < 8) return "Debe tener al menos 8 caracteres.";
    if (!passwordHasUppercase.test(password)) return "Debe incluir una letra mayúscula.";
    if (!passwordHasNumber.test(password)) return "Debe incluir un número.";
    return "";
  }, [password, submitted]);

  const confirmPasswordError = useMemo(() => {
    if (!submitted && !confirmPassword) return "";
    if (!confirmPassword.trim()) return "Debes confirmar la contraseña.";
    if (confirmPassword !== password) return "Las contraseñas no coinciden.";
    return "";
  }, [confirmPassword, password, submitted]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo activar la cuenta",
        text: error,
        confirmButtonColor: COLORS.olive,
        background: "#fffef8",
        color: COLORS.text,
      });
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Cuenta activada",
        text: "Tu usuario fue activado correctamente. Ya puedes iniciar sesión.",
        confirmButtonColor: COLORS.olive,
        background: "#fffef8",
        color: COLORS.text,
      }).then(() => {
        dispatch(clearActivarEmpleadoState());
        navigate("/sign-in");
      });
    }
  }, [success, dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Token inválido",
        text: "No se encontró el token de activación en el enlace.",
        confirmButtonColor: COLORS.olive,
      });
      return;
    }

    if (passwordError || confirmPasswordError) {
      Swal.fire({
        icon: "warning",
        title: "Revisa los datos",
        text: "Corrige los campos antes de continuar.",
        confirmButtonColor: COLORS.olive,
      });
      return;
    }

    await dispatch(
      activarUsuarioEmpresaThunk({
        token,
        password,
      })
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #fcfbf5 0%, #f8f6ea 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#fffdf6",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(73, 80, 21, 0.10)",
          border: "1px solid rgba(120, 121, 63, 0.12)",
        }}
      >
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 14px",
              borderRadius: "16px",
              background: "#F3F0D7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.olive,
            }}
          >
            <FiUserCheck size={24} />
          </div>

          <h2
            style={{
              fontSize: "30px",
              fontWeight: 800,
              marginBottom: "8px",
              color: "#111",
            }}
          >
            Activar cuenta
          </h2>

          <p
            style={{
              fontSize: "15px",
              color: "#666",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Define tu contraseña para activar tu usuario de empleado.
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
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "14px",
                  border: `1px solid ${passwordError ? COLORS.error : COLORS.oliveBorder}`,
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
              <div style={{ marginTop: "8px", color: COLORS.error, fontSize: "13px" }}>
                {passwordError}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 700,
                color: COLORS.text,
                marginBottom: "8px",
              }}
            >
              Confirmar contraseña
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
                type={showConfirm ? "text" : "password"}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "14px",
                  border: `1px solid ${confirmPasswordError ? COLORS.error : COLORS.oliveBorder}`,
                  background: "#fff",
                  padding: "0 48px 0 44px",
                  outline: "none",
                  fontSize: "15px",
                }}
              />

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
            </div>

            {confirmPasswordError && (
              <div style={{ marginTop: "8px", color: COLORS.error, fontSize: "13px" }}>
                {confirmPasswordError}
              </div>
            )}
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
            }}
          >
            {isLoading ? "Activando..." : "Activar cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default RegistroEmpleadoMain;