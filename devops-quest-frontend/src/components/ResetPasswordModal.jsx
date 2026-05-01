import { useState } from "react";
import { resetPassword } from "../services/api";

export default function ResetPasswordModal({ token, onClose }) {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      return setError("Les mots de passe ne correspondent pas");
    }
    if (form.password.length < 6) {
      return setError("Le mot de passe doit faire au moins 6 caractères");
    }
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#020a14",
    border: "1px solid #1e3a5f",
    borderRadius: 2,
    padding: "10px 44px 10px 14px",
    color: "#e2e8f0",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: 10,
    color: "#334155",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#0a1628",
          border: "1px solid #1e3a5f",
          borderTop: "2px solid #22c55e",
          borderRadius: 2,
          padding: 32,
          width: 420,
          animation: "fadeInUp 0.25s ease-out",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#4ade80",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "3px",
          }}>
            // RESET PASSWORD
          </span>
          <p style={{
            fontSize: 11,
            color: "#334155",
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: 4,
          }}>
            Choisis un nouveau mot de passe pour ton compte
          </p>
        </div>

        {success ? (
          <div>
            <div style={{
              background: "#022c0a",
              border: "1px solid #166534",
              borderLeft: "3px solid #22c55e",
              borderRadius: 2,
              padding: "12px 16px",
              fontSize: 12,
              color: "#4ade80",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 16,
            }}>
              ✓ Mot de passe mis à jour avec succès !
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "12px 0",
                background: "#022c0a",
                border: "1px solid #22c55e",
                color: "#22c55e",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: 2,
              }}
            >
              [ > SE CONNECTER ]
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#334155",
                    cursor: "pointer",
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  {showPassword ? "◎" : "○"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="••••••••"
                  required
                  style={{
                    ...inputStyle,
                    borderColor: form.confirm && form.password !== form.confirm ? "#7f1d1d" : "#1e3a5f",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#334155",
                    cursor: "pointer",
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  {showConfirm ? "◎" : "○"}
                </button>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p style={{
                  fontSize: 10,
                  color: "#f87171",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: 4,
                }}>
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {error && (
              <div style={{
                background: "#0d0202",
                border: "1px solid #7f1d1d",
                borderLeft: "3px solid #ef4444",
                borderRadius: 2,
                padding: "10px 14px",
                fontSize: 12,
                color: "#f87171",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 16,
              }}>
                ! {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 0",
                background: loading ? "#0a1628" : "#022c0a",
                border: "1px solid #22c55e",
                color: "#22c55e",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                borderRadius: 2,
                opacity: loading ? 0.7 : 1,
                transition: "all 0.15s",
              }}
            >
              {loading ? "[ CHARGEMENT... ]" : "[ > CHANGER LE MOT DE PASSE ]"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
