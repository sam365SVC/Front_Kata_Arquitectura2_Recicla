import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiShield,
  FiSmartphone,
  FiRepeat,
  FiDollarSign,
} from "react-icons/fi";
import Swal from "sweetalert2";

import {
  clearCheckoutError,
  setMetodoSeleccionado,
  setNitCi,
  setRazonSocial,
  setTipoComprobante,
  
} from "../slicesCheckout/CheckoutSlice";

import {
  confirmarPagoThunk,
  iniciarPagoQrThunk,
  simularPagoTarjetaThunk,
  simularPagoTransferenciaThunk,
  pagarConSaldoThunk,
  confirmarSuscripcionThunk,
  intentarEnviarComprobante,
} from "../slicesCheckout/CheckoutThunk";


// ─── Swal tema con colores del proyecto ───────────────────────────────────────
const swalTheme = {
  confirmButtonColor: "#79864B",
  cancelButtonColor: "#5A6650",
  customClass: { popup: "it-swal-popup" },
  didOpen: () => {
    const container = document.querySelector(".swal2-container");
    if (container) container.style.zIndex = "99999";
  },
};

// ─── Utilidades ───────────────────────────────────────────────────────────────
const formatMoney = (amount, currency = "BOB") =>
  `${currency === "BOB" ? "Bs." : currency} ${Number(amount || 0).toFixed(2)}`;

const normalizeSuscripcion = (suscripcion) => {
  if (!suscripcion) return null;

  return {
    idSuscripcion:
      suscripcion.id_suscripcion_pago ??
      suscripcion.id_suscripcion ??
      suscripcion.id ??
      null,

    total: Number(
      suscripcion.total ??
      suscripcion.monto ??
      suscripcion.precio ??
      0
    ),

    moneda: suscripcion.moneda || "BOB",
    estado: suscripcion.estado || "PENDIENTE",

    items: [
      {
        id: suscripcion.id_suscripcion_pago ?? "plan",
        nombre:
          suscripcion.plan_nombre ||
          suscripcion.nombre ||
          "Suscripción",
        precio: Number(
          suscripcion.total ??
          suscripcion.monto ??
          0
        ),
      },
    ],

    saldoDisponible: Number(suscripcion.saldo_disponible ?? 0),
  };
};

const getQrImageSrc = (qrValue) => {
  if (!qrValue) return "";
  if (
    qrValue.startsWith("data:image") ||
    qrValue.startsWith("http://") ||
    qrValue.startsWith("https://")
  ) {
    return qrValue;
  }
  return `data:image/png;base64,${qrValue}`;
};

const getNombreDesdePerfil = (perfilState, loginState) => {
  const perfil = perfilState?.perfil || perfilState?.data || perfilState || {};
  const user = loginState?.user || {};
  return (
    perfil?.nombre_completo ||
    `${perfil?.nombre || user?.nombre || ""} ${
      perfil?.apellido || user?.apellido || ""
    }`.trim() ||
    user?.name ||
    user?.nombre ||
    ""
  );
};

const getCiDesdePerfil = (perfilState, loginState) => {
  const perfil = perfilState?.perfil || perfilState?.data || perfilState || {};
  const user = loginState?.user || {};
  return (
    perfil?.ci ||
    perfil?.nit_ci ||
    perfil?.nitCi ||
    user?.ci ||
    user?.nit_ci ||
    user?.nitCi ||
    ""
  );
};

const onlyDigits = (value = "") => value.replace(/\D/g, "");

const formatCardNumber = (value = "") => {
  const digits = onlyDigits(value).slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value = "") => {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const detectCardBrand = (value = "") => {
  const digits = onlyDigits(value);
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^(6011|65|64[4-9])/.test(digits)) return "Discover";
  if (/^(36|38|39|30[0-5])/.test(digits)) return "Diners Club";
  if (/^35/.test(digits)) return "JCB";
  if (/^(50|56|57|58|6)/.test(digits)) return "Maestro";
  return "Tarjeta";
};

const luhnCheck = (value = "") => {
  const digits = onlyDigits(value);
  if (digits.length < 13) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

// ─── Logo de marca de tarjeta ─────────────────────────────────────────────────
const BrandLogo = ({ brand }) => {
  const normalized = String(brand || "").toLowerCase();
  if (normalized === "visa")
    return <span className="ckx-brand-logo visa">VISA</span>;
  if (normalized === "mastercard")
    return (
      <span className="ckx-brand-logo mastercard">
        <span className="mc-c1" />
        <span className="mc-c2" />
      </span>
    );
  if (normalized === "american express")
    return <span className="ckx-brand-logo amex">AMEX</span>;
  if (normalized === "discover")
    return <span className="ckx-brand-logo discover">DISCOVER</span>;
  if (normalized === "diners club")
    return <span className="ckx-brand-logo diners">DINERS</span>;
  if (normalized === "jcb")
    return <span className="ckx-brand-logo jcb">JCB</span>;
  if (normalized === "maestro")
    return <span className="ckx-brand-logo maestro">MAESTRO</span>;
  return <span className="ckx-brand-logo generic">CARD</span>;
};

// ─── Componente principal ─────────────────────────────────────────────────────
const CheckoutPagos = ({ onBack, onSuccess }) => {

  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    metodoSeleccionado,
    tipoComprobante,
    razonSocial,
    nitCi,
    qrData,
    pago,
    factura,
    loading,
    procesandoTarjeta,
    procesandoTransferencia,
    procesandoSaldo,
    pagoConfirmado,
    error,
    successMessage,
  } = useSelector((state) => state.checkout);
  const { suscripcion } = useSelector((state) => state.checkout);

  const perfilState = useSelector((state) => state.perfil);
  const loginState = useSelector((state) => state.login);

  const compra = useMemo(() => normalizeSuscripcion(suscripcion), [suscripcion]);
  const qrAutoConfirmRef = useRef(false);
  const successTriggeredRef = useRef(false);
  const qrTimerRef = useRef(null);

  const [qrSecondsLeft, setQrSecondsLeft] = useState(10);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [usarSaldo, setUsarSaldo] = useState(true);
  const [emailEnvio, setEmailEnvio] = useState("");

  const cardBrand = detectCardBrand(cardNumber);
  const cardValid = luhnCheck(cardNumber);
  const qrImageSrc = getQrImageSrc(qrData?.qr);

  const subtotalCursos = Number(compra?.subtotalCursos ?? compra?.total ?? 0);
  const saldoDisponibleActual = Number(compra?.saldoDisponible ?? 0);
  const saldoAplicadoCalculado = usarSaldo
    ? Math.min(saldoDisponibleActual, subtotalCursos)
    : 0;
  const montoPendienteCalculado = Math.max(
    subtotalCursos - saldoAplicadoCalculado,
    0
  );
  const puedePagarSoloConSaldo =
    usarSaldo && montoPendienteCalculado === 0 && saldoAplicadoCalculado > 0;

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    dispatch(confirmarSuscripcionThunk(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!compra || !compra.idSuscripcion) return;
    setUsarSaldo(Number(compra?.saldoDisponible || 0) > 0);
  }, [compra?.idSuscripcion, compra?.saldoDisponible]);

  useEffect(() => {
    successTriggeredRef.current = false;
  }, [compra?.idSuscripcion]);

  useEffect(() => {
    if (!razonSocial) {
      const nombre = getNombreDesdePerfil(perfilState, loginState);
      if (nombre) dispatch(setRazonSocial(nombre));
    }
    if (!nitCi) {
      const ci = getCiDesdePerfil(perfilState, loginState);
      if (ci) dispatch(setNitCi(ci));
    }
  }, [dispatch, perfilState, loginState, razonSocial, nitCi]);

  useEffect(() => {
    qrAutoConfirmRef.current = false;
    setQrSecondsLeft(10);
    if (qrTimerRef.current) {
      clearInterval(qrTimerRef.current);
      qrTimerRef.current = null;
    }
    if (
      metodoSeleccionado !== "QR" ||
      !qrData?.qr ||
      pagoConfirmado ||
      !compra?.idSuscripcion
    )
      return;

    qrTimerRef.current = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(qrTimerRef.current);
          qrTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (qrTimerRef.current) {
        clearInterval(qrTimerRef.current);
        qrTimerRef.current = null;
      }
    };
  }, [metodoSeleccionado, qrData?.qr, pagoConfirmado, compra?.idSuscripcion]);

  useEffect(() => {
    if (!pagoConfirmado || successTriggeredRef.current) return;
    successTriggeredRef.current = true;

    if (!pagoConfirmado || !emailEnvio) return;

    dispatch(intentarEnviarComprobante({
      idPago: id,
      email: emailEnvio,
    }));

    const comprobanteEnviado =
      pago?.comprobante_enviado ?? pago?.comprobanteEnviado ?? true;

    Swal.fire({
      icon: comprobanteEnviado ? "success" : "warning",
      title: comprobanteEnviado ? "¡Pago completado!" : "Pago confirmado",
      text: comprobanteEnviado
        ? "El pago fue completado correctamente."
        : "El pago se realizó, pero no se pudo enviar el comprobante.",
      ...swalTheme,
    });
  }, [pagoConfirmado, onSuccess, factura, compra, pago]);

  useEffect(() => {
    if (metodoSeleccionado !== "QR") return;
    if (!qrData?.qr) return;
    if (!compra?.idSuscripcion) return;
    if (pagoConfirmado) return;
    if (qrAutoConfirmRef.current) return;
    if (qrSecondsLeft > 0) return;

    qrAutoConfirmRef.current = true;
    dispatch(
      confirmarPagoThunk({
        idSuscripcion: compra.idSuscripcion,
        tipo: tipoComprobante,
        razonSocial,
        nitCi,
      })
    );
  }, [
    dispatch,
    metodoSeleccionado,
    qrData?.qr,
    qrSecondsLeft,
    pagoConfirmado,
    compra?.idSuscripcion,
    tipoComprobante,
    razonSocial,
    nitCi,
  ]);

  useEffect(() => {
    console.log("Enviando comprobante");
    if (!pagoConfirmado || successTriggeredRef.current) return;
    successTriggeredRef.current = true;

    const comprobanteEnviado =
      pago?.comprobante_enviado ?? pago?.comprobanteEnviado ?? true;
    if (typeof onSuccess === "function") {
      onSuccess({ factura, compra, pago, comprobanteEnviado });
    }
    if (!comprobanteEnviado) {
      Swal.fire({
        icon: "warning",
        title: "Pago confirmado",
        text: "El pago fue confirmado, pero no se pudo enviar el comprobante por correo.",
        ...swalTheme,
      });
    }
  }, [pagoConfirmado, onSuccess, factura, compra, pago]);
  useEffect(() => {
    if (!pagoConfirmado || !emailEnvio) return;

    dispatch(intentarEnviarComprobante({
      idPago: id,
      email: emailEnvio,
    }));
  }, [pagoConfirmado, emailEnvio, dispatch, id]);

  useEffect(() => {
    if (!error) return;
    const lowered = String(error).toLowerCase();
    if (
      lowered.includes("ya fue confirmado") ||
      lowered.includes("ya está confirmado") ||
      lowered.includes("ya está completada") ||
      lowered.includes("ya está completado")
    ) {
      dispatch(clearCheckoutError());
    }
  }, [error, dispatch]);

  // ─── Validaciones ────────────────────────────────────────────────────────────
  const validateBilling = () => {
    if (!compra?.idSuscripcion) return "No se encontró una compra válida.";
    if (!tipoComprobante) return "Selecciona el tipo de comprobante.";
    if (!razonSocial.trim()) return "Ingresa el nombre o razón social.";
    if (!nitCi.trim()) return "Ingresa el CI o NIT.";
    if (!emailEnvio.trim()) return "Ingresa un correo electrónico.";
    return null;
  };

  const validateCard = () => {
    if (!cardName.trim()) return "Ingresa el nombre del titular.";
    if (onlyDigits(cardNumber).length < 13)
      return "Ingresa un número de tarjeta válido.";
    if (!cardValid) return "El número de tarjeta no es válido.";
    if (onlyDigits(cardExpiry).length !== 4)
      return "Ingresa una fecha de vencimiento válida.";
    if (onlyDigits(cardCvv).length < 3) return "Ingresa un CVV válido.";
    return null;
  };

  const showWarning = async (title, text) => {
    await Swal.fire({
      icon: "warning",
      title,
      text,
      ...swalTheme,
      showCancelButton: false,
    });
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleGenerarQr = async () => {
    const validationError = validateBilling();
    if (validationError) {
      await showWarning("Datos incompletos", validationError);
      return;
    }
    if (montoPendienteCalculado <= 0) {
      await showWarning(
        "Pago externo no requerido",
        "Con el saldo aplicado ya no necesitas generar un QR."
      );
      return;
    }
    try {
      await dispatch(
        iniciarPagoQrThunk({
          idSuscripcion: compra.idSuscripcion,
          total: montoPendienteCalculado,
          moneda: compra.moneda,
          gloss: "Pago de suscripción",
          additionalData: `Compra ${compra.idSuscripcion}`,
        })
      ).unwrap();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo generar el QR",
        text: err || "Ocurrió un error al generar el código QR.",
        ...swalTheme,
      });
    }
  };

  const handlePagarTarjeta = async () => {
    const billingError = validateBilling();
    if (billingError) {
      await showWarning("Datos incompletos", billingError);
      return;
    }
    const cardError = validateCard();
    if (cardError) {
      await showWarning("Tarjeta no válida", cardError);
      return;
    }
    if (montoPendienteCalculado <= 0) {
      await showWarning(
        "Pago externo no requerido",
        "Con el saldo aplicado ya no necesitas pagar con tarjeta."
      );
      return;
    }
    try {
      await dispatch(
        simularPagoTarjetaThunk({
          idSuscripcion: compra.idSuscripcion,
          total: montoPendienteCalculado,
          tipo: tipoComprobante,
          razonSocial,
          nitCi,
        })
      ).unwrap();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo procesar el pago",
        text: err || "Ocurrió un error al procesar el pago con tarjeta.",
        ...swalTheme,
      });
    }
  };

  const handlePagarTransferencia = async () => {
    const billingError = validateBilling();
    if (billingError) {
      await showWarning("Datos incompletos", billingError);
      return;
    }
    if (montoPendienteCalculado <= 0) {
      await showWarning(
        "Pago externo no requerido",
        "Con el saldo aplicado ya no necesitas hacer transferencia."
      );
      return;
    }
    try {
      await dispatch(
        simularPagoTransferenciaThunk({
          idSuscripcion: compra.idSuscripcion,
          total: montoPendienteCalculado,
          tipo: tipoComprobante,
          razonSocial,
          nitCi,
        })
      ).unwrap();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo procesar la transferencia",
        text: err || "Ocurrió un error al confirmar la transferencia.",
        ...swalTheme,
      });
    }
  };

  const handlePagarConSaldo = async () => {
    const billingError = validateBilling();
    if (billingError) {
      await showWarning("Datos incompletos", billingError);
      return;
    }
    if (!puedePagarSoloConSaldo) {
      await showWarning(
        "Saldo insuficiente",
        "Tu saldo no cubre el total completo de la compra."
      );
      return;
    }
    try {
      await dispatch(
        pagarConSaldoThunk({
          idSuscripcion: compra.idSuscripcion,
          tipo: tipoComprobante,
          razonSocial,
          nitCi,
        })
      ).unwrap();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo procesar el pago",
        text: err || "Ocurrió un error al pagar con saldo.",
        ...swalTheme,
      });
    }
  };

  // ─── Empty state ──────────────────────────────────────────────────────────────
  if (!compra) {
    return (
      <div className="ckx-root">
        <style>{styles}</style>
        <div className="ckx-empty">
          <div className="ckx-empty__icon">
            <FiDollarSign size={36} />
          </div>
          <h3>No hay una compra activa</h3>
          <p>Selecciona un plan para continuar con el proceso de pago.</p>
          <button className="ckx-back-btn"  onClick={() => navigate('/planes-pagos')}>
            <FiArrowLeft />
            <span>Volver</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Render principal ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>

      <div className="ckx-root">
        <div className="ckx-shell">

          {/* ── Topbar ── */}
          <div className="ckx-topbar">
            <div className="ckx-topbar__left">
              <div className="ckx-topbar__accent" />
              <div>
                <h2 className="ckx-topbar__title">Finalizar suscripción</h2>
                <p className="ckx-topbar__sub">
                  Completa tus datos, elige el método de pago y confirma tu suscripción.
                </p>
              </div>
            </div>
            <button className="ckx-back-btn" onClick={() => navigate('/planes-pagos')}>
              <FiArrowLeft />
              <span>Volver</span>
            </button>
          </div>

          {/* ── Contenido ── */}
          <div className="ckx-content">

            {/* Alertas */}
            {error && (
              <div className="ckx-alert ckx-alert--error">{error}</div>
            )}
            {successMessage && !pagoConfirmado && (
              <div className="ckx-alert ckx-alert--success">{successMessage}</div>
            )}
            {pagoConfirmado && (
              <div className="ckx-alert ckx-alert--success">
                <FiCheckCircle />
                <span>
                  Pago confirmado correctamente
                  {factura?.numero ? ` · Comprobante N° ${factura.numero}` : ""}
                </span>
              </div>
            )}

            {/* Grid principal */}
            <div className="ckx-grid">

              {/* ── Panel izquierdo ── */}
              <section className="ckx-card ckx-main">

                {/* Sección: Datos de facturación */}
                <div className="ckx-section">
                  <h3 className="ckx-section-title">Datos de facturación</h3>

                  <div className="ckx-field">
                    <label>Tipo de comprobante</label>
                    <select
                      value={tipoComprobante}
                      onChange={(e) => dispatch(setTipoComprobante(e.target.value))}
                      disabled={loading || pagoConfirmado}
                    >
                      <option value="RECIBO">RECIBO</option>
                      <option value="FACTURA">FACTURA</option>
                    </select>
                  </div>

                  <div className="ckx-field">
                    <label>
                      {tipoComprobante === "FACTURA" ? "Razón social" : "Nombre completo"}
                    </label>
                    <input
                      type="text"
                      value={razonSocial}
                      onChange={(e) => dispatch(setRazonSocial(e.target.value))}
                      placeholder={
                        tipoComprobante === "FACTURA"
                          ? "Ingresa la razón social"
                          : "Ingresa tu nombre completo"
                      }
                      disabled={loading || pagoConfirmado}
                    />
                  </div>

                  <div className="ckx-field">
                    <label>{tipoComprobante === "FACTURA" ? "NIT" : "CI / NIT"}</label>
                    <input
                      type="text"
                      value={nitCi}
                      onChange={(e) => dispatch(setNitCi(e.target.value))}
                      placeholder="Ingresa el dato de identificación"
                      disabled={loading || pagoConfirmado}
                    />
                  </div>

                  <div className="ckx-field">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      value={emailEnvio}
                      onChange={(e) => setEmailEnvio(e.target.value)}
                      placeholder="Ingresa tu correo electrónico"
                      disabled={loading || pagoConfirmado}
                    />
                  </div>
                </div>

                {/* Sección: Saldo */}
                <div className="ckx-section">
                  <div className="ckx-pay-header">
                    <div>
                      <h3 className="ckx-section-title">Aplicación de saldo</h3>
                      <p className="ckx-muted">
                        Decide si quieres reducir el monto usando tu saldo disponible.
                      </p>
                    </div>
                  </div>

                  <div className="ckx-balance-card">
                    <div className="ckx-balance-card__row">
                      <div>
                        <span className="ckx-balance-card__label">Usar saldo disponible</span>
                        <strong className="ckx-balance-card__value">
                          {formatMoney(saldoDisponibleActual, compra.moneda)}
                        </strong>
                      </div>
                      <label className="ckx-switch">
                        <input
                          type="checkbox"
                          checked={usarSaldo}
                          onChange={(e) => setUsarSaldo(e.target.checked)}
                          disabled={loading || pagoConfirmado || saldoDisponibleActual <= 0}
                        />
                        <span className="ckx-switch__track" />
                      </label>
                    </div>

                    <div className="ckx-balance-grid">
                      <div className="ckx-mini-box">
                        <span>Subtotal</span>
                        <strong>{formatMoney(subtotalCursos, compra.moneda)}</strong>
                      </div>
                      <div className="ckx-mini-box">
                        <span>Saldo aplicado</span>
                        <strong>{formatMoney(saldoAplicadoCalculado, compra.moneda)}</strong>
                      </div>
                      <div className="ckx-mini-box highlight">
                        <span>Monto pendiente</span>
                        <strong>{formatMoney(montoPendienteCalculado, compra.moneda)}</strong>
                      </div>
                    </div>

                    {usarSaldo && saldoAplicadoCalculado > 0 && (
                      <p className="ckx-note-success">
                        Se aplicará saldo automáticamente para reducir tu pago.
                      </p>
                    )}
                    {!usarSaldo && saldoDisponibleActual > 0 && (
                      <p className="ckx-note-error">
                        No se usará tu saldo; pagarás el total completo externamente.
                      </p>
                    )}
                  </div>
                </div>

                {/* Sección: Método de pago */}
                <div className="ckx-section">
                  <div className="ckx-pay-header">
                    <div>
                      <h3 className="ckx-section-title">Método de pago</h3>
                      <p className="ckx-muted">Elige la forma de pago que prefieras.</p>
                    </div>
                    <div className="ckx-security">
                      <FiShield />
                      <span>Proceso seguro</span>
                    </div>
                  </div>

                  {/* Botones de método */}
                  <div className="ckx-methods ckx-methods--four">
                    {[
                      { key: "QR", icon: <FiSmartphone />, label: "Pago por QR" },
                      { key: "TARJETA", icon: <FiCreditCard />, label: "Tarjeta" },
                      { key: "TRANSFERENCIA", icon: <FiRepeat />, label: "Transferencia" },
                      { key: "SALDO", icon: <FiDollarSign />, label: "Saldo" },
                    ].map(({ key, icon, label }) => (
                      <button
                        key={key}
                        type="button"
                        className={`ckx-method-btn ${metodoSeleccionado === key ? "active" : ""}`}
                        onClick={() => dispatch(setMetodoSeleccionado(key))}
                        disabled={
                          loading ||
                          pagoConfirmado ||
                          (key === "SALDO" && !puedePagarSoloConSaldo)
                        }
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── Panel QR ── */}
                  {metodoSeleccionado === "QR" && (
                    <div className="ckx-paybox">
                      <div className="ckx-paybox-head">
                        <div>
                          <h4>Pago con QR</h4>
                          <p>
                            Genera tu código QR para pagar{" "}
                            <strong>{formatMoney(montoPendienteCalculado, compra.moneda)}</strong>.
                          </p>
                        </div>
                        {!pagoConfirmado && (
                          <button
                            type="button"
                            className="ckx-primary-btn"
                            onClick={handleGenerarQr}
                            disabled={loading || montoPendienteCalculado <= 0}
                          >
                            {loading ? "Generando..." : "Generar QR"}
                          </button>
                        )}
                      </div>

                      {qrData?.qr && (
                        <div className="ckx-qr-wrap">
                          <div className="ckx-qr-box">
                            <img src={qrImageSrc} alt="QR de pago" />
                          </div>
                          <div className="ckx-qr-statuses">
                            <span className="ckx-status-pill">
                              Tiempo restante: {qrSecondsLeft}s
                            </span>
                          </div>
                          {!pagoConfirmado && qrSecondsLeft > 0 && (
                            <p className="ckx-note-success">Procesando pago...</p>
                          )}
                          {!pagoConfirmado && qrSecondsLeft === 0 && (
                            <p className="ckx-note-success">Confirmando suscripción...</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Panel Tarjeta ── */}
                  {metodoSeleccionado === "TARJETA" && (
                    <div className="ckx-paybox">
                      <div className="ckx-card-preview">
                        <div className="ckx-card-preview__top">
                          <span className="ckx-card-chip" />
                          <BrandLogo brand={cardBrand} />
                        </div>
                        <div className="ckx-card-number">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>
                        <div className="ckx-card-preview__bottom">
                          <div>
                            <small>Titular</small>
                            <strong>{cardName || "NOMBRE DEL TITULAR"}</strong>
                          </div>
                          <div>
                            <small>Vence</small>
                            <strong>{cardExpiry || "MM/AA"}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="ckx-card-form">
                        <div className="ckx-field">
                          <label>Nombre del titular</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Nombre como figura en la tarjeta"
                            disabled={loading || pagoConfirmado}
                          />
                        </div>

                        <div className="ckx-field">
                          <label>Número de tarjeta</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="0000 0000 0000 0000"
                            disabled={loading || pagoConfirmado}
                          />
                          <div className="ckx-inline-meta">
                            <span>{cardBrand}</span>
                            <span className={cardValid ? "valid" : ""}>
                              {onlyDigits(cardNumber).length >= 13
                                ? cardValid
                                  ? "Número válido"
                                  : "Número inválido"
                                : "Ingresa tu tarjeta"}
                            </span>
                          </div>
                        </div>

                        <div className="ckx-card-grid">
                          <div className="ckx-field">
                            <label>Vencimiento</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              placeholder="MM/AA"
                              disabled={loading || pagoConfirmado}
                            />
                          </div>
                          <div className="ckx-field">
                            <label>CVV</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) =>
                                setCardCvv(onlyDigits(e.target.value).slice(0, 4))
                              }
                              placeholder="***"
                              disabled={loading || pagoConfirmado}
                            />
                          </div>
                        </div>

                        <div className="ckx-card-secure">
                          <FiLock />
                          <span>Tus datos se procesan de forma segura.</span>
                        </div>

                        {!pagoConfirmado && (
                          <button
                            type="button"
                            className="ckx-primary-btn ckx-primary-btn--confirm"
                            onClick={handlePagarTarjeta}
                            disabled={loading || montoPendienteCalculado <= 0}
                          >
                            {procesandoTarjeta
                              ? "Procesando pago..."
                              : `Pagar ${formatMoney(montoPendienteCalculado, compra.moneda)}`}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Panel Transferencia ── */}
                  {metodoSeleccionado === "TRANSFERENCIA" && (
                    <div className="ckx-paybox">
                      <div className="ckx-paybox-head">
                        <div>
                          <h4>Transferencia bancaria</h4>
                          <p>
                            Usa los siguientes datos para pagar{" "}
                            <strong>{formatMoney(montoPendienteCalculado, compra.moneda)}</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="ckx-transfer-box">
                        {[
                          { label: "Banco", value: "Banco Nacional de Bolivia" },
                          { label: "Titular", value: "Universidad Católica Boliviana" },
                          { label: "Número de cuenta", value: "100-200-300-400" },
                          { label: "Moneda", value: compra.moneda },
                          { label: "Monto", value: formatMoney(montoPendienteCalculado, compra.moneda) },
                        ].map(({ label, value }) => (
                          <div className="ckx-transfer-row" key={label}>
                            <span>{label}</span>
                            <strong>{value}</strong>
                          </div>
                        ))}
                      </div>

                      {!pagoConfirmado && (
                        <button
                          type="button"
                          className="ckx-primary-btn"
                          onClick={handlePagarTransferencia}
                          disabled={loading || montoPendienteCalculado <= 0}
                        >
                          {procesandoTransferencia
                            ? "Procesando pago..."
                            : "Confirmar transferencia"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── Panel Saldo ── */}
                  {metodoSeleccionado === "SALDO" && (
                    <div className="ckx-paybox">
                      <div className="ckx-paybox-head">
                        <div>
                          <h4>Pago con saldo</h4>
                          <p>Usa tu saldo disponible para cubrir el total de la compra.</p>
                        </div>
                      </div>

                      <div className="ckx-transfer-box">
                        {[
                          { label: "Saldo disponible", value: formatMoney(saldoDisponibleActual, compra.moneda) },
                          { label: "Saldo aplicado", value: formatMoney(saldoAplicadoCalculado, compra.moneda) },
                          { label: "Monto pendiente", value: formatMoney(montoPendienteCalculado, compra.moneda) },
                        ].map(({ label, value }) => (
                          <div className="ckx-transfer-row" key={label}>
                            <span>{label}</span>
                            <strong>{value}</strong>
                          </div>
                        ))}
                      </div>

                      {!puedePagarSoloConSaldo && (
                        <p className="ckx-note-error">
                          Para pagar solo con saldo, el monto pendiente debe quedar en cero.
                        </p>
                      )}

                      {!pagoConfirmado && (
                        <button
                          type="button"
                          className="ckx-primary-btn ckx-primary-btn--confirm"
                          onClick={handlePagarConSaldo}
                          disabled={loading || !puedePagarSoloConSaldo}
                        >
                          {procesandoSaldo ? "Procesando pago..." : "Pagar con saldo"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* ── Panel derecho: Resumen ── */}
              <aside className="ckx-card ckx-summary">
                <h3 className="ckx-section-title">Resumen del pedido</h3>

                <div className="ckx-summary-block">
                  <span className="ckx-label">Estado</span>
                  <strong className="ckx-estado-badge">{compra.estado}</strong>
                </div>

                <div className="ckx-order-list">
                  {compra.items.length > 0 ? (
                    compra.items.map((item) => (
                      <div className="ckx-order-item" key={item.id}>
                        <div>
                          <h4>{item.nombre}</h4>
                        </div>
                        <strong>{formatMoney(item.precio, compra.moneda)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="ckx-order-item">
                      <div>
                        <h4>Compra académica</h4>
                      </div>
                      <strong>{formatMoney(compra.total, compra.moneda)}</strong>
                    </div>
                  )}
                </div>

                <div className="ckx-summary-totals">
                  <div>
                    <span>Plan suscripcion</span>
                    <strong>{formatMoney(subtotalCursos, compra.moneda)}</strong>
                  </div>
                  <div>
                    <span>Saldo aplicado</span>
                    <strong>{formatMoney(saldoAplicadoCalculado, compra.moneda)}</strong>
                  </div>
                  <div>
                    <span>Pago externo</span>
                    <strong>{formatMoney(montoPendienteCalculado, compra.moneda)}</strong>
                  </div>
                  <div className="ckx-total-row">
                    <span>Total</span>
                    <strong>{formatMoney(subtotalCursos, compra.moneda)}</strong>
                  </div>
                </div>

                <div className="ckx-summary-method">
                  <span className="ckx-label">Método seleccionado</span>
                  <strong>
                    {metodoSeleccionado === "QR"
                      ? "Pago por QR"
                      : metodoSeleccionado === "TARJETA"
                      ? cardBrand
                      : metodoSeleccionado === "TRANSFERENCIA"
                      ? "Transferencia"
                      : "Saldo"}
                  </strong>
                </div>

                {factura && pagoConfirmado && (
                  <div className="ckx-proof">
                    <h3>Comprobante generado</h3>
                    <p><strong>Tipo:</strong> {factura.tipo}</p>
                    <p><strong>Número:</strong> {factura.numero}</p>
                    <p><strong>A nombre de:</strong> {factura.razon_social}</p>
                    <p><strong>CI / NIT:</strong> {factura.nit_ci}</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Estilos con paleta verde/oliva del proyecto ──────────────────────────────
const styles = `
  /* ── Variables locales mapeadas desde el design system ── */
  .ckx-root {
    --ckx-white:        #ffffff;
    --ckx-black:        #2F3E2C;
    --ckx-black-2:      #5A6650;
    --ckx-black-3:      #1F2A1D;
    --ckx-text-body:    #4A5743;
    --ckx-heading:      #2F3E2C;
    --ckx-main:         #79864B;
    --ckx-main-2:       #EEE9BF;
    --ckx-main-3:       #BDB77C;
    --ckx-main-4:       #78793F;
    --ckx-main-5:       #8A7D4C;
    --ckx-yellow:       #EEE9BF;
    --ckx-grey-1:       #F5F7F2;
    --ckx-grey-2:       #EEF1E8;
    --ckx-grey-3:       #FBFFFE;
    --ckx-grey-4:       #E4E8DC;
    --ckx-grey-5:       #F8F6EC;
    --ckx-border:       #D6DBC8;
    --ckx-success-bg:   #EEF3E6;
    --ckx-success-text: #2F3E2C;
    --ckx-success-brd:  #BDB77C;
    --ckx-error-bg:     #FFF1F0;
    --ckx-error-text:   #7A2C2C;
    --ckx-error-brd:    #F2C6C6;
  }

  /* ── Reset / base ── */
  .ckx-root {
    min-height: 100%;
    padding: 16px 18px 32px;
    background: transparent;
    box-sizing: border-box;
    font-family: 'Sora', 'Segoe UI', sans-serif;
    color: var(--ckx-text-body);
  }

  *, .ckx-root * { box-sizing: border-box; }

  /* ── Shell ── */
  .ckx-shell {
    background: var(--ckx-white);
    border: 1px solid var(--ckx-border);
    border-radius: 22px;
    box-shadow: 0 12px 32px rgba(47, 62, 44, 0.08);
    overflow: hidden;
  }

  /* ── Topbar ── */
  .ckx-topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    flex-wrap: wrap;
    padding: 18px 24px 16px;
    border-bottom: 1px solid var(--ckx-grey-4);
    background: var(--ckx-grey-1);
  }

  .ckx-topbar__left {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .ckx-topbar__accent {
    width: 6px;
    height: 40px;
    border-radius: 999px;
    background: linear-gradient(180deg, var(--ckx-main) 0%, var(--ckx-main-4) 100%);
    margin-top: 2px;
    flex-shrink: 0;
  }

  .ckx-topbar__title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--ckx-heading);
    font-family: 'Epilogue', sans-serif;
  }

  .ckx-topbar__sub {
    margin: 4px 0 0;
    color: var(--ckx-black-2);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.55;
  }

  /* ── Back btn ── */
  .ckx-back-btn {
    border: 1px solid var(--ckx-border);
    background: var(--ckx-white);
    color: var(--ckx-black);
    border-radius: 14px;
    padding: 10px 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: .18s ease;
  }

  .ckx-back-btn:hover {
    background: var(--ckx-grey-2);
    transform: translateY(-1px);
  }

  /* ── Content ── */
  .ckx-content {
    padding: 22px 24px;
    background: var(--ckx-grey-1);
  }

  /* ── Alertas ── */
  .ckx-alert {
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 18px;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ckx-alert--error {
    background: var(--ckx-error-bg);
    color: var(--ckx-error-text);
    border: 1px solid var(--ckx-error-brd);
  }

  .ckx-alert--success {
    background: var(--ckx-success-bg);
    color: var(--ckx-success-text);
    border: 1px solid var(--ckx-success-brd);
  }

  /* ── Grid ── */
  .ckx-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(300px, .9fr);
    gap: 22px;
    align-items: start;
  }

  /* ── Cards ── */
  .ckx-card {
    background: var(--ckx-white);
    border: 1px solid var(--ckx-border);
    border-radius: 20px;
    box-shadow: 0 8px 20px rgba(47, 62, 44, 0.06);
  }

  .ckx-main { padding: 24px; }

  .ckx-summary {
    padding: 24px;
    position: sticky;
    top: 20px;
  }

  /* ── Secciones ── */
  .ckx-section + .ckx-section {
    margin-top: 26px;
    padding-top: 24px;
    border-top: 1px solid var(--ckx-grey-4);
  }

  .ckx-section-title {
    margin: 0 0 18px;
    font-size: 18px;
    color: var(--ckx-heading);
    font-weight: 800;
    font-family: 'Epilogue', sans-serif;
  }

  /* ── Campos ── */
  .ckx-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .ckx-field label {
    font-size: 13px;
    color: var(--ckx-black-2);
    font-weight: 700;
  }

  .ckx-field input,
  .ckx-field select {
    width: 100%;
    min-height: 46px;
    border: 1px solid var(--ckx-border);
    border-radius: 12px;
    background: var(--ckx-white);
    padding: 0 14px;
    font-size: 14px;
    color: var(--ckx-black);
    outline: none;
    transition: .18s ease;
    font-family: 'Sora', sans-serif;
  }

  .ckx-field input:focus,
  .ckx-field select:focus {
    border-color: var(--ckx-main);
    box-shadow: 0 0 0 4px rgba(121, 134, 75, 0.12);
  }

  .ckx-field input:disabled,
  .ckx-field select:disabled {
    background: var(--ckx-grey-2);
    opacity: .7;
    cursor: not-allowed;
  }

  /* ── Pay header ── */
  .ckx-pay-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .ckx-muted {
    margin: 5px 0 0;
    color: var(--ckx-black-2);
    font-size: 13px;
    line-height: 1.5;
    font-weight: 600;
  }

  .ckx-security {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 12px;
    border-radius: 999px;
    background: var(--ckx-grey-5);
    border: 1px solid var(--ckx-border);
    color: var(--ckx-main-4);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  /* ── Balance card ── */
  .ckx-balance-card {
    border: 1px solid var(--ckx-border);
    background: var(--ckx-grey-5);
    border-radius: 16px;
    padding: 18px;
  }

  .ckx-balance-card__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .ckx-balance-card__label {
    display: block;
    font-size: 13px;
    color: var(--ckx-black-2);
    font-weight: 700;
    margin-bottom: 5px;
  }

  .ckx-balance-card__value {
    color: var(--ckx-heading);
    font-size: 18px;
    font-weight: 900;
  }

  /* ── Switch ── */
  .ckx-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }

  .ckx-switch input { display: none; }

  .ckx-switch__track {
    width: 52px;
    height: 28px;
    border-radius: 999px;
    background: var(--ckx-grey-4);
    position: relative;
    transition: .2s ease;
  }

  .ckx-switch__track::after {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--ckx-white);
    box-shadow: 0 2px 6px rgba(47, 62, 44, 0.2);
    transition: .2s ease;
  }

  .ckx-switch input:checked + .ckx-switch__track {
    background: var(--ckx-main);
  }

  .ckx-switch input:checked + .ckx-switch__track::after {
    left: 28px;
  }

  /* ── Balance grid ── */
  .ckx-balance-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 4px;
  }

  .ckx-mini-box {
    padding: 13px;
    border-radius: 12px;
    border: 1px solid var(--ckx-border);
    background: var(--ckx-white);
  }

  .ckx-mini-box span {
    display: block;
    font-size: 11px;
    color: var(--ckx-black-2);
    font-weight: 700;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: .4px;
  }

  .ckx-mini-box strong {
    color: var(--ckx-heading);
    font-size: 15px;
    font-weight: 900;
  }

  .ckx-mini-box.highlight {
    background: var(--ckx-main-2);
    border-color: var(--ckx-main-3);
  }

  .ckx-mini-box.highlight strong {
    color: var(--ckx-main-4);
  }

  /* ── Métodos ── */
  .ckx-methods {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 18px;
  }

  .ckx-methods--four {
    grid-template-columns: repeat(4, 1fr);
  }

  .ckx-method-btn {
    min-height: 54px;
    border-radius: 14px;
    border: 1px solid var(--ckx-border);
    background: var(--ckx-white);
    color: var(--ckx-black);
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    cursor: pointer;
    transition: .18s ease;
    font-family: 'Sora', sans-serif;
  }

  .ckx-method-btn:hover:not(:disabled) {
    background: var(--ckx-grey-2);
    border-color: var(--ckx-main-3);
    color: var(--ckx-main-4);
    transform: translateY(-1px);
  }

  .ckx-method-btn.active {
    background: linear-gradient(135deg, var(--ckx-main) 0%, var(--ckx-main-4) 100%);
    color: var(--ckx-white);
    border-color: var(--ckx-main-4);
    box-shadow: 0 10px 22px rgba(121, 134, 75, 0.28);
  }

  .ckx-method-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
  }

  /* ── Paybox ── */
  .ckx-paybox {
    border: 1px solid var(--ckx-border);
    background: var(--ckx-grey-3);
    border-radius: 18px;
    padding: 20px;
  }

  .ckx-paybox-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .ckx-paybox-head h4 {
    margin: 0 0 6px;
    color: var(--ckx-heading);
    font-size: 17px;
    font-weight: 800;
    font-family: 'Epilogue', sans-serif;
  }

  .ckx-paybox-head p {
    margin: 0;
    color: var(--ckx-black-2);
    font-size: 14px;
    line-height: 1.55;
    font-weight: 600;
    max-width: 500px;
  }

  /* ── Botón primario ── */
  .ckx-primary-btn {
    min-height: 46px;
    border: none;
    border-radius: 12px;
    padding: 0 20px;
    background: linear-gradient(135deg, var(--ckx-main) 0%, var(--ckx-main-4) 100%);
    color: var(--ckx-white);
    font-weight: 800;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(121, 134, 75, 0.26);
    transition: .18s ease;
    font-family: 'Sora', sans-serif;
    white-space: nowrap;
  }

  .ckx-primary-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(121, 134, 75, 0.34);
  }

  .ckx-primary-btn:disabled {
    opacity: .65;
    cursor: not-allowed;
    transform: none;
  }

  .ckx-primary-btn--confirm {
    width: 100%;
    background: linear-gradient(135deg, var(--ckx-main-5) 0%, var(--ckx-main-4) 100%);
    box-shadow: 0 10px 20px rgba(138, 125, 76, 0.26);
  }

  /* ── QR ── */
  .ckx-qr-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding-top: 8px;
  }

  .ckx-qr-box {
    width: 240px;
    height: 240px;
    border-radius: 20px;
    background: var(--ckx-white);
    border: 2px solid var(--ckx-border);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 28px rgba(47, 62, 44, 0.1);
    padding: 16px;
  }

  .ckx-qr-box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .ckx-qr-statuses {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .ckx-status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    border-radius: 999px;
    padding: 0 14px;
    background: var(--ckx-grey-5);
    color: var(--ckx-main-4);
    font-size: 12px;
    font-weight: 700;
    border: 1px solid var(--ckx-border);
  }

  /* ── Notas ── */
  .ckx-note-error {
    margin: 12px 0 0;
    color: var(--ckx-error-text);
    font-size: 13px;
    font-weight: 700;
  }

  .ckx-note-success {
    margin: 0;
    color: var(--ckx-main-4);
    font-size: 13px;
    font-weight: 700;
  }

  /* ── Card preview (tarjeta bancaria) ── */
  .ckx-card-preview {
    border-radius: 22px;
    padding: 22px;
    background:
      radial-gradient(circle at top right, rgba(238,233,191,.15), transparent 28%),
      linear-gradient(135deg, var(--ckx-black-3) 0%, var(--ckx-black) 55%, var(--ckx-main-4) 100%);
    color: var(--ckx-white);
    box-shadow: 0 16px 30px rgba(47, 62, 44, 0.22);
    margin-bottom: 20px;
  }

  .ckx-card-preview__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
  }

  .ckx-card-chip {
    width: 42px;
    height: 30px;
    border-radius: 8px;
    background: linear-gradient(135deg, #EEE9BF 0%, #BDB77C 100%);
    display: inline-block;
  }

  .ckx-brand-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 70px;
    height: 28px;
    border-radius: 999px;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .4px;
    background: rgba(238, 233, 191, 0.14);
    border: 1px solid rgba(238, 233, 191, 0.22);
    color: var(--ckx-white);
  }

  .ckx-brand-logo.visa    { background: rgba(22, 92, 255, .22); }
  .ckx-brand-logo.amex    { background: rgba(34, 165, 224, .22); }
  .ckx-brand-logo.discover { background: rgba(255, 122, 0, .18); }
  .ckx-brand-logo.diners  { background: rgba(80, 120, 255, .16); }
  .ckx-brand-logo.jcb     { background: rgba(0, 200, 120, .16); }
  .ckx-brand-logo.maestro { background: rgba(255, 0, 102, .16); }

  .ckx-brand-logo.mastercard {
    min-width: 70px;
    gap: 0;
    background: transparent;
    border: none;
    padding: 0;
  }

  .ckx-brand-logo.mastercard .mc-c1,
  .ckx-brand-logo.mastercard .mc-c2 {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: inline-block;
  }

  .ckx-brand-logo.mastercard .mc-c1 { background: #eb001b; margin-right: -6px; z-index: 2; }
  .ckx-brand-logo.mastercard .mc-c2 { background: #f79e1b; z-index: 1; }

  .ckx-card-number {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 1px;
    margin-bottom: 24px;
    line-height: 1.2;
    word-break: break-word;
    font-family: 'Sora', monospace;
  }

  .ckx-card-preview__bottom {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .ckx-card-preview__bottom small {
    display: block;
    color: rgba(238,233,191,.72);
    margin-bottom: 5px;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: .9px;
  }

  .ckx-card-preview__bottom strong {
    font-size: 13px;
    font-weight: 800;
  }

  .ckx-card-form { display: flex; flex-direction: column; gap: 0; }

  .ckx-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .ckx-inline-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: var(--ckx-black-2);
    font-size: 12px;
    font-weight: 700;
    margin-top: 4px;
  }

  .ckx-inline-meta .valid { color: var(--ckx-main-4); }

  .ckx-card-secure {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--ckx-black-2);
    font-weight: 700;
    background: var(--ckx-grey-2);
    border: 1px solid var(--ckx-border);
    border-radius: 12px;
    padding: 11px 14px;
    margin: 2px 0 16px;
  }

  /* ── Transferencia box ── */
  .ckx-transfer-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border-radius: 14px;
    background: var(--ckx-white);
    border: 1px solid var(--ckx-border);
    margin-bottom: 18px;
  }

  .ckx-transfer-row {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: center;
    font-size: 14px;
    padding: 6px 0;
    border-bottom: 1px solid var(--ckx-grey-4);
  }

  .ckx-transfer-row:last-child { border-bottom: none; }

  .ckx-transfer-row span {
    color: var(--ckx-black-2);
    font-weight: 700;
  }

  .ckx-transfer-row strong {
    color: var(--ckx-heading);
    font-weight: 800;
    text-align: right;
  }

  /* ── Resumen sidebar ── */
  .ckx-summary-block, .ckx-summary-method { margin-bottom: 16px; }

  .ckx-label {
    display: block;
    color: var(--ckx-black-2);
    font-size: 12px;
    margin-bottom: 6px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .5px;
  }

  .ckx-summary-block strong,
  .ckx-summary-method strong {
    color: var(--ckx-heading);
    font-size: 15px;
    font-weight: 800;
  }

  .ckx-estado-badge {
    display: inline-block;
    background: var(--ckx-main-2);
    color: var(--ckx-main-4);
    border: 1px solid var(--ckx-main-3);
    border-radius: 999px;
    padding: 4px 14px;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .3px;
  }

  .ckx-order-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 14px 0 18px;
  }

  .ckx-order-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 13px 14px;
    border: 1px solid var(--ckx-border);
    background: var(--ckx-grey-5);
    border-radius: 14px;
  }

  .ckx-order-item h4 {
    margin: 0;
    color: var(--ckx-heading);
    font-size: 14px;
    font-weight: 800;
    line-height: 1.35;
    font-family: 'Epilogue', sans-serif;
  }

  .ckx-order-item strong {
    color: var(--ckx-main-4);
    font-size: 14px;
    font-weight: 900;
    white-space: nowrap;
  }

  .ckx-summary-totals {
    border-top: 1px solid var(--ckx-border);
    border-bottom: 1px solid var(--ckx-border);
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .ckx-summary-totals > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .ckx-summary-totals span {
    color: var(--ckx-black-2);
    font-weight: 700;
    font-size: 14px;
  }

  .ckx-summary-totals strong {
    color: var(--ckx-heading);
    font-size: 15px;
    font-weight: 900;
  }

  .ckx-total-row strong {
    color: var(--ckx-main);
    font-size: 21px;
  }

  /* ── Comprobante ── */
  .ckx-proof {
    margin-top: 20px;
    border: 1px solid var(--ckx-success-brd);
    background: var(--ckx-success-bg);
    border-radius: 14px;
    padding: 16px;
  }

  .ckx-proof h3 {
    margin: 0 0 10px;
    color: var(--ckx-heading);
    font-size: 15px;
    font-weight: 800;
    font-family: 'Epilogue', sans-serif;
  }

  .ckx-proof p {
    margin: 0 0 6px;
    color: var(--ckx-black-2);
    font-size: 13px;
    line-height: 1.5;
  }

  /* ── Empty state ── */
  .ckx-empty {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--ckx-white);
    border: 1px solid var(--ckx-border);
    border-radius: 22px;
    box-shadow: 0 16px 40px rgba(47, 62, 44, 0.08);
    text-align: center;
    gap: 12px;
    padding: 40px;
  }

  .ckx-empty__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--ckx-main-2);
    border: 2px solid var(--ckx-main-3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ckx-main-4);
    margin-bottom: 8px;
  }

  .ckx-empty h3 {
    margin: 0;
    color: var(--ckx-heading);
    font-size: 24px;
    font-weight: 800;
    font-family: 'Epilogue', sans-serif;
  }

  .ckx-empty p {
    margin: 0 0 10px;
    color: var(--ckx-black-2);
    font-size: 15px;
    font-weight: 600;
  }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .ckx-grid { grid-template-columns: 1fr; }
    .ckx-summary { position: static; }
    .ckx-methods--four { grid-template-columns: 1fr 1fr; }
    .ckx-balance-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .ckx-root { padding: 10px 10px 24px; }
    .ckx-topbar, .ckx-content { padding-left: 16px; padding-right: 16px; }
    .ckx-topbar__title { font-size: 17px; }
    .ckx-main, .ckx-summary { padding: 16px 14px; border-radius: 18px; }
    .ckx-methods, .ckx-methods--four, .ckx-card-grid { grid-template-columns: 1fr; }
    .ckx-qr-box { width: 100%; max-width: 240px; height: auto; aspect-ratio: 1/1; }
    .ckx-card-number { font-size: 20px; }
    .ckx-transfer-row { flex-direction: column; align-items: flex-start; }
    .ckx-transfer-row strong { text-align: left; }
  }
`;

export default CheckoutPagos;
