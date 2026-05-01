/**
 * Section — Titre de section réutilisable (style terminal)
 */
export default function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
      }}>
        <span style={{
          color: "#22c55e",
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          userSelect: "none",
        }}>$</span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#475569",
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "2px",
        }}>{title}</span>
        <div style={{
          flex: 1,
          height: 1,
          background: "#0f1f35",
        }} />
      </div>
      {children}
    </div>
  );
}
