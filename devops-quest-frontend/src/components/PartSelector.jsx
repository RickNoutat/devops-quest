/**
 * PartSelector — Cartes de sélection Part 1 / Part 2
 */
export default function PartSelector({ parts, activePart, onSelect }) {
  return (
    <div style={{
      display: "flex",
      gap: 12,
      padding: "24px 40px",
      maxWidth: 1200,
      margin: "0 auto",
    }}>
      {parts.map((part, i) => {
        const active = activePart === part.id;
        return (
          <button
            key={part.id}
            onClick={() => onSelect(part.id)}
            style={{
              flex: 1,
              background: active ? "#0a1628" : "#020617",
              border: `1px solid ${active ? "#22c55e" : "#1e3a5f"}`,
              borderLeft: `3px solid ${active ? "#22c55e" : "#1e3a5f"}`,
              borderRadius: 2,
              padding: "18px 20px",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "left",
              animation: `fadeInUp 0.5s ease-out ${i * 0.08}s both`,
            }}
          >
            {/* Label module */}
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: active ? "#22c55e" : "#334155",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{ color: active ? "#22c55e" : "#1e3a5f" }}>{active ? ">" : " "}</span>
              MODULE_{String(i + 1).padStart(2, "0")}
            </div>

            {/* Titre */}
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: active ? "#e2e8f0" : "#64748b",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 10,
              lineHeight: 1.4,
            }}>{part.title}</div>

            {/* Métadonnées */}
            <div style={{
              fontSize: 11,
              color: "#334155",
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex",
              gap: 12,
            }}>
              <span>{part.stepsCount} ÉTAPES</span>
              <span style={{ color: "#1e3a5f" }}>·</span>
              <span style={{ color: active ? "#f59e0b" : "#334155" }}>{part.totalXP} XP</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
