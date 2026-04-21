import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

import "./CheckoutPagos.scss";

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

const swalTheme = {
  confirmButtonColor: "#79864B",
  cancelButtonColor: "#5A6650",
  customClass: { popup: "it-swal-popup" },
  didOpen: () => {
    const container = document.querySelector(".swal2-container");
    if (container) container.style.zIndex = "99999";
  },
};

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
    planNombre:
      suscripcion.nombre_plan ||
      suscripcion.plan_nombre ||
      suscripcion.nombre ||
      "Suscripción",

    items: [
      {
        id: suscripcion.id_suscripcion_pago ?? "plan",
        nombre:
          suscripcion.nombre_plan ||
          suscripcion.plan_nombre ||
          suscripcion.nombre ||
          "Suscripción",
        precio: Number(
          suscripcion.total ??
            suscripcion.monto ??
            suscripcion.precio ??
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
    `${perfil?.nombre || user?.nombre || ""} ${perfil?.apellido || user?.apellido || ""}`.trim() ||
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

const BrandLogo = ({ brand }) => {
  const normalized = String(brand || "").toLowerCase();

  if (normalized === "visa") {
    return <span className="ckx-brand-logo visa">VISA</span>;
  }

  if (normalized === "mastercard") {
    return (
      <span className="ckx-brand-logo mastercard">
        <span className="mc-c1" />
        <span className="mc-c2" />
      </span>
    );
  }

  if (normalized === "american express") {
    return <span className="ckx-brand-logo amex">AMEX</span>;
  }

  if (normalized === "discover") {
    return <span className="ckx-brand-logo discover">DISCOVER</span>;
  }

  if (normalized === "diners club") {
    return <span className="ckx-brand-logo diners">DINERS</span>;
  }

  if (normalized === "jcb") {
    return <span className="ckx-brand-logo jcb">JCB</span>;
  }

  if (normalized === "maestro") {
    return <span className="ckx-brand-logo maestro">MAESTRO</span>;
  }

  return <span className="ckx-brand-logo generic">CARD</span>;
};

const CheckoutPagos = ({ onSuccess }) => {
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
    suscripcionActual,
    planChange,
  } = useSelector((state) => state.checkout);

  const perfilState = useSelector((state) => state.perfil);
  const loginState = useSelector((state) => state.login);

  const compra = useMemo(
    () => normalizeSuscripcion(suscripcionActual),
    [suscripcionActual]
  );

  const qrAutoConfirmRef = useRef(false);
  const successHandledRef = useRef(false);
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

  const subtotalCursos = Number(compra?.total ?? 0);
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

  useEffect(() => {
    if (!id) return;
    dispatch(confirmarSuscripcionThunk(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!compra?.idSuscripcion) return;
    setUsarSaldo(Number(compra?.saldoDisponible || 0) > 0);
  }, [compra?.idSuscripcion, compra?.saldoDisponible]);

  useEffect(() => {
    successHandledRef.current = false;
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
    ) {
      return;
    }

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
    ).catch(() => {});
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
    if (!pagoConfirmado) return;
    if (successHandledRef.current) return;

    successHandledRef.current = true;

    const redirigirConExito = async () => {
      let comprobanteEnviado = true;

      try {
        if (emailEnvio?.trim() && compra?.idSuscripcion) {
          const resp = await dispatch(
            intentarEnviarComprobante({
              idSuscripcionPago: compra.idSuscripcion,
              email: emailEnvio,
            })
          );

          comprobanteEnviado =
            resp?.meta?.requestStatus === "fulfilled";
        }

        if (typeof onSuccess === "function") {
          onSuccess({
            factura,
            compra,
            pago,
            comprobanteEnviado,
            planChange,
          });
        }

        await Swal.fire({
          icon: comprobanteEnviado ? "success" : "warning",
          title: comprobanteEnviado ? "Pago confirmado" : "Pago confirmado con aviso",
          text:
            successMessage ||
            (comprobanteEnviado
              ? "La suscripción fue pagada correctamente."
              : "La suscripción fue pagada, pero no se pudo enviar el comprobante por correo."),
          ...swalTheme,
        });
      } catch {
        // no bloqueamos redirección
      } finally {
        navigate("/admin-empresa");
      }
    };

    redirigirConExito();
  }, [
    pagoConfirmado,
    pago,
    factura,
    compra,
    emailEnvio,
    dispatch,
    navigate,
    onSuccess,
    successMessage,
    planChange,
  ]);

  useEffect(() => {
    if (!error) return;

    const lowered = String(error).toLowerCase();

    if (
      lowered.includes("ya fue confirmado") ||
      lowered.includes("ya está confirmado") ||
      lowered.includes("ya esta confirmado") ||
      lowered.includes("ya está completada") ||
      lowered.includes("ya esta completada") ||
      lowered.includes("ya está completado") ||
      lowered.includes("ya esta completado")
    ) {
      dispatch(clearCheckoutError());
    }
  }, [error, dispatch]);

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
    if (onlyDigits(cardNumber).length < 13) {
      return "Ingresa un número de tarjeta válido.";
    }
    if (!cardValid) return "El número de tarjeta no es válido.";
    if (onlyDigits(cardExpiry).length !== 4) {
      return "Ingresa una fecha de vencimiento válida.";
    }
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
          tipoPago: "SAAS",
          gloss: "Pago de suscripción",
          additionalData: `Suscripción ${compra.idSuscripcion}`,
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
          tipoPago: "SAAS",
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
          tipoPago: "SAAS",
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
          tipoPago: "SAAS",
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

  if (!compra) {
    return (
      <div className="ckx-root">
        <div className="ckx-empty">
          <div className="ckx-empty__icon">
            <FiDollarSign size={36} />
          </div>
          <h3>No hay una compra activa</h3>
          <p>Selecciona un plan para continuar con el proceso de pago.</p>
          <button
            className="ckx-back-btn"
            onClick={() => navigate("/admin-empresa")}
          >
            <FiArrowLeft />
            <span>Volver</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ckx-root">
      <div className="ckx-shell">
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

          <button
            className="ckx-back-btn"
            onClick={() => navigate("/admin-empresa")}
          >
            <FiArrowLeft />
            <span>Volver</span>
          </button>
        </div>

        <div className="ckx-content">
          {error && <div className="ckx-alert ckx-alert--error">{error}</div>}

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

          <div className="ckx-grid">
            <section className="ckx-card ckx-main">
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
                    {tipoComprobante === "FACTURA"
                      ? "Razón social"
                      : "Nombre completo"}
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
                  <label>
                    {tipoComprobante === "FACTURA" ? "NIT" : "CI / NIT"}
                  </label>
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
                      <span className="ckx-balance-card__label">
                        Usar saldo disponible
                      </span>
                      <strong className="ckx-balance-card__value">
                        {formatMoney(saldoDisponibleActual, compra.moneda)}
                      </strong>
                    </div>

                    <label className="ckx-switch">
                      <input
                        type="checkbox"
                        checked={usarSaldo}
                        onChange={(e) => setUsarSaldo(e.target.checked)}
                        disabled={
                          loading ||
                          pagoConfirmado ||
                          saldoDisponibleActual <= 0
                        }
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
                      <strong>
                        {formatMoney(saldoAplicadoCalculado, compra.moneda)}
                      </strong>
                    </div>

                    <div className="ckx-mini-box highlight">
                      <span>Monto pendiente</span>
                      <strong>
                        {formatMoney(montoPendienteCalculado, compra.moneda)}
                      </strong>
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
                      className={`ckx-method-btn ${
                        metodoSeleccionado === key ? "active" : ""
                      }`}
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

                {metodoSeleccionado === "QR" && (
                  <div className="ckx-paybox">
                    <div className="ckx-paybox-head">
                      <div>
                        <h4>Pago con QR</h4>
                        <p>
                          Genera tu código QR para pagar{" "}
                          <strong>
                            {formatMoney(montoPendienteCalculado, compra.moneda)}
                          </strong>.
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
                          <p className="ckx-note-success">
                            Confirmando suscripción...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

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
                          onChange={(e) =>
                            setCardNumber(formatCardNumber(e.target.value))
                          }
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
                            onChange={(e) =>
                              setCardExpiry(formatExpiry(e.target.value))
                            }
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
                            : `Pagar ${formatMoney(
                                montoPendienteCalculado,
                                compra.moneda
                              )}`}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {metodoSeleccionado === "TRANSFERENCIA" && (
                  <div className="ckx-paybox">
                    <div className="ckx-paybox-head">
                      <div>
                        <h4>Transferencia bancaria</h4>
                        <p>
                          Usa los siguientes datos para pagar{" "}
                          <strong>
                            {formatMoney(montoPendienteCalculado, compra.moneda)}
                          </strong>.
                        </p>
                      </div>
                    </div>

                    <div className="ckx-transfer-box">
                      {[
                        { label: "Banco", value: "Banco Nacional de Bolivia" },
                        {
                          label: "Titular",
                          value: "Universidad Católica Boliviana",
                        },
                        { label: "Número de cuenta", value: "100-200-300-400" },
                        { label: "Moneda", value: compra.moneda },
                        {
                          label: "Monto",
                          value: formatMoney(
                            montoPendienteCalculado,
                            compra.moneda
                          ),
                        },
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
                        {
                          label: "Saldo disponible",
                          value: formatMoney(saldoDisponibleActual, compra.moneda),
                        },
                        {
                          label: "Saldo aplicado",
                          value: formatMoney(saldoAplicadoCalculado, compra.moneda),
                        },
                        {
                          label: "Monto pendiente",
                          value: formatMoney(montoPendienteCalculado, compra.moneda),
                        },
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
                        {procesandoSaldo
                          ? "Procesando pago..."
                          : "Pagar con saldo"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

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
                      <h4>{compra.planNombre}</h4>
                    </div>
                    <strong>{formatMoney(compra.total, compra.moneda)}</strong>
                  </div>
                )}
              </div>

              <div className="ckx-summary-totals">
                <div>
                  <span>Plan suscripción</span>
                  <strong>{formatMoney(subtotalCursos, compra.moneda)}</strong>
                </div>
                <div>
                  <span>Saldo aplicado</span>
                  <strong>
                    {formatMoney(saldoAplicadoCalculado, compra.moneda)}
                  </strong>
                </div>
                <div>
                  <span>Pago externo</span>
                  <strong>
                    {formatMoney(montoPendienteCalculado, compra.moneda)}
                  </strong>
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
                  <p>
                    <strong>Tipo:</strong> {factura.tipo}
                  </p>
                  <p>
                    <strong>Número:</strong> {factura.numero}
                  </p>
                  <p>
                    <strong>A nombre de:</strong> {factura.razon_social}
                  </p>
                  <p>
                    <strong>CI / NIT:</strong> {factura.nit_ci}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPagos;