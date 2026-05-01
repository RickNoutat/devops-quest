/**
 * StepsSidebar — Liste des étapes dans la sidebar
 */
import DifficultyBadge from "./DifficultyBadge";

export default function StepsSidebar({ steps, completedSteps, activeStep, onSelectStep }) {
  const completedCount = steps.filter((s) => completedSteps.includes(s.id)).length;

  return (
    <div style={{
      background: "#020617",
      border: "1px solid #1e3a5f",
      borderRadius: 2,
      maxHeight: "70vh",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header quest log */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #1e3a5f",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#334155",
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "2px",
        }}>// quest_log</span>
        <span style={{
          fontSize: 10,
          color: "#22c55e",
          fontFamily: "'JetBrains Mono', monospace",
        }}>{completedCount}/{steps.length}</span>
      </div>

      {/* Liste des étapes */}
      <div style={{ padding: 8 }}>
        {steps.map((step, i) => {
          const done = completedSteps.includes(step.id);
          const active = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 10px",
                background: active ? "#0a1628" : "transparent",
                border: "none",
                borderLeft: `2px solid ${active ? "#22c55e" : "transparent"}`,
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left",
                animation: `fadeInUp 0.3s ease-out ${i * 0.025}s both`,
              }}
            >
              {/* Numéro / check */}
              <div style={{
                width: 28,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: done ? "#22c55e" : active ? "#94a3b8" : "#334155",
                border: `1px solid ${done ? "#166534" : active ? "#1e3a5f" : "#0f1f35"}`,
                borderRadius: 2,
                background: done ? "#0a1628" : "#020617",
                flexShrink: 0,
              }}>
                {done ? "✓" : String(step.number).padStart(2, "0")}
              </div>

              {/* Titre + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: active ? "#e2e8f0" : done ? "#4ade80" : "#64748b",
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: 3,
                }}>{step.title}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <DifficultyBadge level={step.difficulty} />
                  {step.estimatedTime && (
                    <span style={{
                      fontSize: 9,
                      color: "#334155",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{step.estimatedTime}</span>
                  )}
                </div>
              </div>

              {/* XP */}
              <span style={{
                fontSize: 10,
                color: done ? "#f59e0b" : "#334155",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0,
              }}>+{step.xp}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
