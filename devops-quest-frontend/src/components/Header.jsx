/**
 * Header — Barre supérieure avec XP, progression, auth et leaderboard
 */
import StatBadge from "./StatBadge";
import { useAuth } from "../contexts/AuthContext";

const SEGMENTS = 30;

export default function Header({ stats, userXP = 0, completedCount, onLoginClick, onLeaderboardClick }) {
  const { user, logout } = useAuth();
  const total = stats?.totalSteps || 0;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;
  const filledSegments = Math.round((progress / 100) * SEGMENTS);

  const btnBase = {
    background: "none",
    border: "1px solid #1e3a5f",
    borderRadius: 2,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    cursor: "pointer",
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "5px 12px",
    transition: "all 0.15s",
  };

  return (
    <header style={{
      padding: "16px 40px",
      background: "#020617",
      borderBottom: "1px solid #1e3a5f",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Ligne logo + stats + boutons */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
              <span style={{
                fontSize: 11,
                color: "#334155",
                fontFamily: "'JetBrains Mono', monospace",
                userSelect: "none",
              }}>root@devops:~$</span>
              <h1 style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#4ade80",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "4px",
              }}>DEVOPS_QUEST</h1>
              <span style={{
                display: "inline-block",
                width: 8,
                height: 16,
                background: "#22c55e",
                animation: "blink 1.1s step-end infinite",
                flexShrink: 0,
              }} />
            </div>
            <p style={{
              fontSize: 10,
              color: "#334155",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "2px",
            }}>// Jenkins · Docker · Azure</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatBadge label="XP" value={userXP} color="#f59e0b" />
            <StatBadge label="STEPS" value={`${completedCount}/${total}`} color="#22c55e" />

            {/* Leaderboard */}
            <button
              onClick={onLeaderboardClick}
              style={{ ...btnBase, color: "#f59e0b", borderColor: "#78350f" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f59e0b";
                e.currentTarget.style.background = "#0d0a00";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#78350f";
                e.currentTarget.style.background = "none";
              }}
            >
              ▲ TOP
            </button>

            {/* Auth */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 11,
                  color: "#4ade80",
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "#022c0a",
                  border: "1px solid #166534",
                  borderRadius: 2,
                  padding: "5px 10px",
                }}>
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  style={{ ...btnBase, color: "#ef4444", borderColor: "#7f1d1d" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#ef4444";
                    e.currentTarget.style.background = "#0d0202";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#7f1d1d";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  logout
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                style={{ ...btnBase, color: "#22c55e", borderColor: "#166534" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#22c55e";
                  e.currentTarget.style.background = "#022c0a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#166534";
                  e.currentTarget.style.background = "none";
                }}
              >
                [ login ]
              </button>
            )}
          </div>
        </div>

        {/* Barre de progression segmentée */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 9,
            color: "#334155",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "1px",
            flexShrink: 0,
          }}>progress</span>
          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {Array.from({ length: SEGMENTS }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 5,
                  background: i < filledSegments ? "#22c55e" : "#0f1f35",
                  border: `1px solid ${i < filledSegments ? "#166534" : "#1e3a5f"}`,
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <span style={{
            fontSize: 11,
            color: "#22c55e",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            flexShrink: 0,
            minWidth: 34,
            textAlign: "right",
          }}>{Math.round(progress)}%</span>
        </div>

      </div>
    </header>
  );
}
