/**
 * DifficultyBadge — Facile / Moyen / Difficile
 */
const cfg = {
  easy:   { label: "EASY",   color: "#22c55e", bg: "#0a1628", border: "#166534" },
  medium: { label: "MED",    color: "#f59e0b", bg: "#0d0a00", border: "#78350f" },
  hard:   { label: "HARD",   color: "#ef4444", bg: "#0d0202", border: "#7f1d1d" },
};

export default function DifficultyBadge({ level }) {
  const c = cfg[level] || cfg.easy;
  return (
    <span style={{
      fontSize: 9,
      color: c.color,
      background: c.bg,
      padding: "2px 7px",
      border: `1px solid ${c.border}`,
      borderRadius: 2,
      fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: "1px",
    }}>{c.label}</span>
  );
}
