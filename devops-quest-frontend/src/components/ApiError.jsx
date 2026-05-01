/**
 * ApiError — Écran affiché quand l'API est inaccessible
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ApiError() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{
        border: "1px solid #7f1d1d",
        borderLeft: "3px solid #ef4444",
        borderRadius: 2,
        padding: "28px 36px",
        maxWidth: 480,
        background: "#0d0202",
      }}>
        <div style={{
          fontSize: 10,
          color: "#ef4444",
          textTransform: "uppercase",
          letterSpacing: "2px",
          marginBottom: 16,
        }}>ERROR: CONNECTION_FAILED</div>

        <h1 style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#f87171",
          marginBottom: 12,
        }}>API inaccessible</h1>

        <p style={{
          color: "#64748b",
          fontSize: 12,
          lineHeight: 1.7,
          marginBottom: 16,
        }}>
          Impossible de joindre l'API sur{" "}
          <code style={{
            color: "#94a3b8",
            background: "#020617",
            padding: "1px 6px",
            border: "1px solid #1e3a5f",
            fontSize: 12,
          }}>{API_URL}</code>
        </p>

        <div style={{
          background: "#020617",
          border: "1px solid #1e3a5f",
          borderLeft: "3px solid #22c55e",
          padding: "10px 14px",
          fontSize: 12,
          color: "#4ade80",
        }}>
          $ cd devops-quest-api && pnpm dev
        </div>
      </div>
    </div>
  );
}
