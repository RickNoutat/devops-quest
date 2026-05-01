/**
 * StatBadge — Badge compteur terminal
 */
export default function StatBadge({ label, value, color }) {
  return (
    <div style={{
      background: "#0a1628",
      border: "1px solid #1e3a5f",
      borderRadius: 2,
      padding: "6px 14px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 1,
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 700,
        color,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontSize: 9,
        color: "#334155",
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase",
        letterSpacing: "1.5px",
      }}>{label}</div>
    </div>
  );
}
