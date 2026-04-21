import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

// ─── Fonts ────────────────────────────────────────────────────────────────────
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    input::placeholder { color: #b0b098; }
  `}</style>
)

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconLock = ({ s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)
const IconEye = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.9 17.9A10 10 0 0112 20c-7 0-11-8-11-8a18.1 18.1 0 015.1-5.9M9.9 4.2A9.8 9.8 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.1 3.1M1 1l22 22"/>
  </svg>
)
const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8efcc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconShield = ({ s = 16, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconUser = ({ s = 16, c = "#8a9070" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const IconBriefcase = ({ s = 16, c = "#8a9070" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
  </svg>
)
const IconMail = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 6 10-6"/>
  </svg>
)
const IconLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8efcc" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12h8M12 8v8"/>
  </svg>
)
const IconKey = ({ s = 40, c = "#78793F" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5L18 10M13 5l2 2"/>
  </svg>
)

// ─── Password strength ────────────────────────────────────────────────────────
function getPwChecks(pw) {
  return [
    { id: "len",     pass: pw.length >= 8,                              label: "Al menos 8 caracteres"     },
    { id: "upper",   pass: /[A-Z]/.test(pw),                            label: "Una letra mayúscula"        },
    { id: "lower",   pass: /[a-z]/.test(pw),                            label: "Una letra minúscula"        },
    { id: "num",     pass: /[0-9]/.test(pw),                            label: "Un número"                  },
    { id: "special", pass: /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(pw),     label: "Un carácter especial"       },
  ]
}

function strengthLabel(score) {
  if (score === 0) return { label: "", color: "#e0ddd0" }
  if (score <= 2)  return { label: "Débil",    color: "#E24B4A" }
  if (score === 3) return { label: "Regular",  color: "#BA7517" }
  if (score === 4) return { label: "Buena",    color: "#639922" }
  return              { label: "Excelente", color: "#3B6D11" }
}

// ─── Input with icon ──────────────────────────────────────────────────────────
function Field({ label, children, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#5a6040", letterSpacing: ".02em" }}>{label}</label>
      {children}
      <span style={{ fontSize: 11, color: "#c0392b", minHeight: 14 }}>{error || ""}</span>
    </div>
  )
}

function PwInput({ id, value, onChange, placeholder, show, onToggle, status }) {
  const border = status === "err" ? "#c0392b" : status === "ok" ? "#5a8a3a" : "#ddddc8"
  const bg     = status === "err" ? "#fff8f8" : status === "ok" ? "#f8fdf5" : "#fff"
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#78793F", pointerEvents: "none" }}>
        <IconLock s={15}/>
      </span>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
        style={{ width: "100%", padding: "11px 38px 11px 36px", border: `1.5px solid ${border}`, borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: bg, color: "#2d3320", outline: "none", transition: "border-color .15s" }}
        onFocus={e => { e.target.style.borderColor = "#78793F"; e.target.style.boxShadow = "0 0 0 3px rgba(120,121,63,.12)" }}
        onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = "none" }}
      />
      <button type="button" onClick={onToggle} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8a9070", padding: 0, display: "flex" }}>
        {show ? <IconEyeOff s={14}/> : <IconEye s={14}/>}
      </button>
    </div>
  )
}

// ─── Token validation mock ────────────────────────────────────────────────────
// Replace this with your real API call: GET /api/auth/validate-token?token=xxx
async function validateToken(token) {
  // Simulates API delay
  await new Promise(r => setTimeout(r, 900))
  // Mock: any non-empty token returns employee data
  if (!token || token.length < 10) throw new Error("Token inválido o expirado")
  return {
    nombre:   "Martina López",
    cargo:    "Analista de Valoración",
    empresa:  "TechCorp Bolivia S.A.",
    email:    "m.lopez@techcorp.bo",
  }
}

// ─── Register employee mock ───────────────────────────────────────────────────
// Replace with: POST /api/auth/registro-empleado  { token, password }
async function registerEmployee({ token, password }) {
  await new Promise(r => setTimeout(r, 1000))
  if (!token) throw new Error("Token inválido")
  return { ok: true }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegistroEmpleado() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const token          = searchParams.get("token") || ""

  // States
  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError,   setTokenError]   = useState("")
  const [employee,     setEmployee]     = useState(null)

  const [password,     setPassword]     = useState("")
  const [confirm,      setConfirm]      = useState("")
  const [showPw,       setShowPw]       = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [touched,      setTouched]      = useState({ password: false, confirm: false })
  const [submitting,   setSubmitting]   = useState(false)
  const [submitError,  setSubmitError]  = useState("")
  const [success,      setSuccess]      = useState(false)

  // ── Validate token on mount ─────────────────────────────────────────────────
  useEffect(() => {
    setLoadingToken(true)
    validateToken(token)
      .then(data => { setEmployee(data); setLoadingToken(false) })
      .catch(err  => { setTokenError(err.message); setLoadingToken(false) })
  }, [token])

  // ── Derived ─────────────────────────────────────────────────────────────────
  const checks    = getPwChecks(password)
  const score     = checks.filter(c => c.pass).length
  const strength  = strengthLabel(score)

  const pwError   = touched.password && password.length > 0 && score < 5
    ? "La contraseña no cumple todos los requisitos"
    : touched.password && !password
    ? "La contraseña es requerida"
    : ""

  const cfError   = touched.confirm && confirm !== password
    ? "Las contraseñas no coinciden"
    : touched.confirm && !confirm
    ? "Confirma tu contraseña"
    : ""

  const pwStatus  = !touched.password ? "" : pwError ? "err" : "ok"
  const cfStatus  = !touched.confirm  ? "" : cfError  ? "err" : "ok"

  const canSubmit = score === 5 && password === confirm && !submitting

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ password: true, confirm: true })
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError("")
    try {
      await registerEmployee({ token, password })
      setSuccess(true)
      // Redirect to login after 3s
      setTimeout(() => navigate("/sign-in"), 3000)
    } catch (err) {
      setSubmitError(err.message || "Error al registrar. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Fonts/>
      <div style={{ minHeight: "100vh", background: "#f5f4ef", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Top bar ── */}
        <div style={{ background: "#2d3320", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "#78793F", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconLogo/>
          </div>
          <span style={{ fontFamily: "'Lora', serif", color: "#e8e8d8", fontSize: 15, fontWeight: 500 }}>Valoración</span>
          <span style={{ fontSize: 11, color: "#6a7455", marginLeft: 4 }}>· Portal de empleados</span>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>

          {/* ── Loading token ── */}
          {loadingToken && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, border: "3px solid #e0ddd0", borderTopColor: "#78793F", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }}/>
              <p style={{ fontSize: 14, color: "#8a9070" }}>Verificando enlace de invitación...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* ── Token error ── */}
          {!loadingToken && tokenError && (
            <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fcebeb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#2d3320", marginBottom: 8 }}>Enlace inválido o expirado</h2>
              <p style={{ fontSize: 13, color: "#8a9070", lineHeight: 1.6 }}>
                Este enlace de registro ya fue usado, expiró, o no es válido.<br/>
                Contacta a tu administrador para recibir un nuevo enlace.
              </p>
              <div style={{ marginTop: 20, padding: "12px 16px", background: "#fcebeb", border: "1px solid #f0c0c0", borderRadius: 10, fontSize: 12, color: "#791f1f", fontFamily: "monospace", wordBreak: "break-all" }}>
                Token: {token.slice(0, 16)}...
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {!loadingToken && success && (
            <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#2d3320", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <IconCheck/>
              </div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: "#2d3320", marginBottom: 8 }}>¡Cuenta activada!</h2>
              <p style={{ fontSize: 13, color: "#8a9070", lineHeight: 1.6 }}>
                Tu contraseña fue configurada correctamente.<br/>
                Redirigiendo al inicio de sesión...
              </p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ width: 20, height: 20, border: "2px solid #e0ddd0", borderTopColor: "#78793F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
                <span style={{ fontSize: 12, color: "#8a9070" }}>Redirigiendo en unos segundos...</span>
              </div>
            </div>
          )}

          {/* ── Main form ── */}
          {!loadingToken && !tokenError && !success && employee && (
            <div style={{ width: "100%", maxWidth: 880, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, background: "#fff", borderRadius: 16, border: "1px solid #e8e8d8", overflow: "hidden" }}>

              {/* Left panel — employee info */}
              <div style={{ background: "#2d3320", padding: "44px 40px", display: "flex", flexDirection: "column" }}>
                {/* Icon */}
                <div style={{ width: 56, height: 56, background: "rgba(120,121,63,.3)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
                  <IconKey s={30} c="#c8e090"/>
                </div>

                <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: "#e8efcc", fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
                  Activa tu cuenta de empleado
                </h1>
                <p style={{ fontSize: 13, color: "#8a9070", lineHeight: 1.7, marginBottom: 32 }}>
                  Fuiste invitado al sistema de Valoración. Crea una contraseña segura para completar tu registro.
                </p>

                {/* Employee card */}
                <div style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "18px 20px", marginBottom: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#78793F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#e8efcc", fontWeight: 500, flexShrink: 0 }}>
                      {employee.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, color: "#e8efcc", fontWeight: 500 }}>{employee.nombre}</div>
                      <div style={{ fontSize: 11, color: "#8a9070", marginTop: 2 }}>{employee.email}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <IconBriefcase s={13} c="#6a7455"/>
                      <span style={{ fontSize: 12, color: "#9aaa80" }}>{employee.cargo}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <IconUser s={13} c="#6a7455"/>
                      <span style={{ fontSize: 12, color: "#9aaa80" }}>{employee.empresa}</span>
                    </div>
                  </div>
                </div>

                {/* Token reference */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 10, color: "#4a5235", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Token de invitación</div>
                  <div style={{ fontSize: 10, color: "#5a6645", fontFamily: "monospace", background: "rgba(0,0,0,.2)", padding: "6px 10px", borderRadius: 6, wordBreak: "break-all", lineHeight: 1.6 }}>
                    {token.slice(0, 32)}...
                  </div>
                </div>
              </div>

              {/* Right panel — form */}
              <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#2d3320", fontWeight: 600, marginBottom: 6 }}>Crea tu contraseña</h2>
                  <p style={{ fontSize: 12, color: "#8a9070" }}>Elige una contraseña segura para proteger tu cuenta.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>

                  {/* Email (readonly, visual) */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: "#5a6040", letterSpacing: ".02em", display: "block", marginBottom: 5 }}>Correo electrónico</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f8f8f2", border: "1.5px solid #e8e8d8", borderRadius: 10 }}>
                      <IconMail s={14} c="#8a9070"/>
                      <span style={{ fontSize: 13, color: "#6a7455" }}>{employee.email}</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#8a9070", background: "#eaf3de", padding: "2px 8px", borderRadius: 20, color: "#3B6D11" }}>Verificado</span>
                    </div>
                  </div>

                  {/* Password */}
                  <Field label="Nueva contraseña *" error={pwError}>
                    <PwInput
                      id="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setTouched(t => ({ ...t, password: true })) }}
                      placeholder="Mínimo 8 caracteres"
                      show={showPw}
                      onToggle={() => setShowPw(v => !v)}
                      status={pwStatus}
                    />
                  </Field>

                  {/* Strength bar */}
                  {password && (
                    <div style={{ marginTop: -8, marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: "#8a9070" }}>Fortaleza</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: strength.color }}>{strength.label}</span>
                      </div>
                      <div style={{ height: 4, background: "#e8e8d8", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(score / 5) * 100}%`, background: strength.color, borderRadius: 2, transition: "width .3s, background .3s" }}/>
                      </div>
                    </div>
                  )}

                  {/* Requirements checklist */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginBottom: 18, marginTop: 6 }}>
                    {getPwChecks(password).map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: !password ? "#b0b098" : c.pass ? "#3B6D11" : "#A32D2D" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: !password ? "#d8d8c8" : c.pass ? "#5a8a3a" : "#E24B4A", transition: "background .2s" }}/>
                        {c.label}
                      </div>
                    ))}
                  </div>

                  {/* Confirm */}
                  <Field label="Confirmar contraseña *" error={cfError}>
                    <PwInput
                      id="confirm"
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setTouched(t => ({ ...t, confirm: true })) }}
                      placeholder="Repite tu contraseña"
                      show={showConfirm}
                      onToggle={() => setShowConfirm(v => !v)}
                      status={cfStatus}
                    />
                  </Field>

                  {/* Submit error */}
                  {submitError && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fcebeb", border: "1px solid #f0c0c0", borderRadius: 9, marginBottom: 4 }}>
                      <IconAlert/>
                      <span style={{ fontSize: 12, color: "#791f1f" }}>{submitError}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{ marginTop: "auto", padding: "13px", background: canSubmit ? "#2d3320" : "#b0b098", color: "#e8efcc", border: "none", borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: canSubmit ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width: 16, height: 16, border: "2px solid rgba(232,239,204,.3)", borderTopColor: "#e8efcc", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
                        Activando cuenta...
                      </>
                    ) : (
                      <>
                        <IconShield s={15} c="#e8efcc"/>
                        Activar mi cuenta
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: 11, color: "#b0b098", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
                    Al activar tu cuenta aceptas los términos de uso de la plataforma.
                  </p>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  )
}