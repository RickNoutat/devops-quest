/**
 * StepDetail — Détail d'une étape
 * - Instructions = cases à cocher (actions manuelles, liens)
 * - Commandes = blocs copiables (CLI) avec onglets multi-OS si applicable
 *
 */
import { useState } from "react";
import DifficultyBadge from "./DifficultyBadge";
import Section from "./Section";

const osLabels = { linux: "LINUX", mac: "MACOS", windows: "WIN" };

export default function StepDetail({ step, isCompleted, onToggleComplete }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [checkedInstructions, setCheckedInstructions] = useState([]);
  const [osPrefs, setOsPrefs] = useState({});

  if (!step) {
    return (
      <div style={{
        background: "#020617",
        border: "1px solid #1e3a5f",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#334155",
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        &lt;-- Sélectionne une étape
      </div>
    );
  }

  const copy = (text, i) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const toggleInstruction = (idx) => {
    setCheckedInstructions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const getOsPref = (cmdIdx) => osPrefs[cmdIdx] || "linux";
  const setOsPref = (cmdIdx, os) => setOsPrefs((p) => ({ ...p, [cmdIdx]: os }));

  const getCmd = (cmd, cmdIdx) => {
    if (!cmd.os) return cmd.cmd;
    const pref = getOsPref(cmdIdx);
    return cmd.os[pref] || cmd.cmd;
  };

  return (
    <div style={{
      background: "#020617",
      border: "1px solid #1e3a5f",
      borderRadius: 2,
      padding: 28,
      maxHeight: "70vh",
      overflowY: "auto",
      animation: "fadeInUp 0.35s ease-out",
    }}>

      {/* En-tête */}
      <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #0f1f35" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#334155",
            background: "#0a1628",
            padding: "3px 8px",
            border: "1px solid #1e3a5f",
            borderRadius: 2,
          }}>TASK #{String(step.number).padStart(3, "0")}</span>
          <DifficultyBadge level={step.difficulty} />
          {step.estimatedTime && (
            <span style={{
              fontSize: 10,
              color: "#334155",
              fontFamily: "'JetBrains Mono', monospace",
            }}>{step.estimatedTime}</span>
          )}
          <span style={{
            marginLeft: "auto",
            fontSize: 13,
            color: "#f59e0b",
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}>+{step.xp} XP</span>
        </div>
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 10,
          color: "#e2e8f0",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.4,
        }}>{step.title}</h2>
        <p style={{
          fontSize: 13,
          color: "#64748b",
          lineHeight: 1.7,
          fontFamily: "'JetBrains Mono', monospace",
        }}>{step.description}</p>
      </div>

      {/* Instructions (cases à cocher) */}
      {step.instructions?.length > 0 && (
        <Section title="INSTRUCTIONS">
          {step.instructions.map((inst, i) => {
            const checked = checkedInstructions.includes(i);
            return (
              <div key={i} style={{ marginBottom: 8 }}>
                <label style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 2,
                  background: checked ? "#0a1628" : "#020617",
                  border: `1px solid ${checked ? "#166534" : "#1e3a5f"}`,
                  borderLeft: `2px solid ${checked ? "#22c55e" : "#1e3a5f"}`,
                  transition: "all 0.15s",
                }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInstruction(i)}
                    style={{
                      marginTop: 2,
                      accentColor: "#22c55e",
                      width: 14,
                      height: 14,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: checked ? "#4ade80" : "#94a3b8",
                      textDecoration: checked ? "line-through" : "none",
                    }}>
                      {inst.text}
                    </span>
                    {inst.links?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                        {inst.links.map((link, j) => (
                          <a
                            key={j}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 11,
                              color: "#38bdf8",
                              background: "#0a1628",
                              padding: "3px 8px",
                              borderRadius: 2,
                              border: "1px solid #1e3a5f",
                              textDecoration: "none",
                              fontFamily: "'JetBrains Mono', monospace",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#38bdf8";
                              e.currentTarget.style.color = "#7dd3fc";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#1e3a5f";
                              e.currentTarget.style.color = "#38bdf8";
                            }}
                          >
                            ^ {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </Section>
      )}

      {/* Commandes */}
      {step.commands?.length > 0 && (
        <Section title="COMMANDES">
          {step.commands.map((cmd, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              {cmd.note && (
                <div style={{
                  fontSize: 11,
                  color: "#334155",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 6,
                  paddingLeft: 4,
                }}>// {cmd.note}</div>
              )}

              {cmd.os && (
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {Object.keys(cmd.os).map((osKey) => {
                    const active = getOsPref(i) === osKey;
                    return (
                      <button
                        key={osKey}
                        onClick={() => setOsPref(i, osKey)}
                        style={{
                          fontSize: 10,
                          padding: "2px 10px",
                          borderRadius: 2,
                          cursor: "pointer",
                          border: `1px solid ${active ? "#22c55e" : "#1e3a5f"}`,
                          background: active ? "#0a1628" : "#020617",
                          color: active ? "#22c55e" : "#334155",
                          fontFamily: "'JetBrains Mono', monospace",
                          transition: "all 0.15s",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        {osLabels[osKey] || osKey}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="code-block" onClick={() => copy(getCmd(cmd, i), i)}>
                <button
                  className="copy-btn"
                  onClick={(e) => { e.stopPropagation(); copy(getCmd(cmd, i), i); }}
                >
                  {copiedIdx === i ? "[ COPIED ]" : "[ COPY ]"}
                </button>
                {getCmd(cmd, i)}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Validation */}
      <Section title="VALIDATION">
        <div style={{
          background: "#020a10",
          border: "1px solid #166534",
          borderLeft: "3px solid #22c55e",
          borderRadius: 2,
          padding: "12px 16px",
          fontSize: 13,
          color: "#4ade80",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.7,
        }}>{step.validation}</div>
      </Section>

      {/* Tips */}
      {step.tips?.length > 0 && (
        <Section title="ASTUCES">
          {step.tips.map((tip, i) => (
            <div key={i} style={{
              background: "#0d0a00",
              border: "1px solid #78350f",
              borderLeft: "3px solid #f59e0b",
              borderRadius: 2,
              padding: "10px 14px",
              fontSize: 13,
              color: "#fbbf24",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 8,
              lineHeight: 1.7,
            }}>{tip}</div>
          ))}
        </Section>
      )}

      {/* Traps */}
      {step.traps?.length > 0 && (
        <Section title="WARNINGS">
          {step.traps.map((trap, i) => (
            <div key={i} style={{
              background: "#0d0202",
              border: "1px solid #7f1d1d",
              borderLeft: "3px solid #ef4444",
              borderRadius: 2,
              padding: "10px 14px",
              fontSize: 13,
              color: "#f87171",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 8,
              lineHeight: 1.7,
            }}>{trap}</div>
          ))}
        </Section>
      )}

      {/* Bouton de complétion */}
      <button
        onClick={() => onToggleComplete(step.id)}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: 2,
          border: isCompleted
            ? "1px solid #166534"
            : "1px solid #22c55e",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          cursor: "pointer",
          transition: "all 0.2s",
          background: isCompleted ? "#0a1628" : "#022c0a",
          color: isCompleted ? "#4ade80" : "#22c55e",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isCompleted ? "#0f1f35" : "#052e16";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isCompleted ? "#0a1628" : "#022c0a";
        }}
      >
        {isCompleted
          ? "[ MISSION ACCOMPLIE — ANNULER ]"
          : "[ > VALIDER LA COMPLETION ]"}
      </button>
    </div>
  );
}
