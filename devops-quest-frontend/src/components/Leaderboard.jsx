/**
 * Leaderboard — Classement des participants par XP
 */

import { useState, useEffect } from "react";
import { fetchLeaderboard } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const MEDAL = { 1: "▲", 2: "▲", 3: "▲" };
const MEDAL_COLOR = { 1: "#f59e0b", 2: "#94a3b8", 3: "#b45309" };

export default function Leaderboard({ onClose }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0a1628",
          border: "1px solid #1e3a5f",
          borderTop: "2px solid #f59e0b",
          borderRadius: 2,
          padding: 32,
          width: 560,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          animation: "fadeInUp 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#f59e0b",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "3px",
              marginBottom: 4,
            }}>// LEADERBOARD</div>
            <p style={{
              fontSize: 11,
              color: "#334155",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Top participants par XP total
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#334155",
              cursor: "pointer",
              fontSize: 18,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Ma position */}
        {user && data?.currentUserRank && (
          <div style={{
            background: "#020a10",
            border: "1px solid #166534",
            borderLeft: "3px solid #22c55e",
            borderRadius: 2,
            padding: "10px 16px",
            fontSize: 12,
            color: "#4ade80",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 16,
            flexShrink: 0,
          }}>
            Ta position : #{data.currentUserRank} parmi {data.leaderboard.length > 49
              ? "50+" : data.leaderboard.length} participants
          </div>
        )}

        {/* Contenu */}
        <div style={{ overflowY: "auto", flex: 1 }}>
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
            }}>
              ! {error}
            </div>
          )}

          {!data && !error && (
            <div style={{
              textAlign: "center",
              color: "#334155",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              padding: 24,
            }}>
              Chargement...
            </div>
          )}

          {data?.leaderboard.length === 0 && (
            <div style={{
              textAlign: "center",
              color: "#334155",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              padding: 24,
            }}>
              Aucun participant pour l'instant. Sois le premier !
            </div>
          )}

          {data?.leaderboard.map((entry) => {
            const isMe = user && entry.id === user.id;
            return (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  marginBottom: 4,
                  background: isMe ? "#020a10" : "#020617",
                  border: `1px solid ${isMe ? "#166534" : "#0f1f35"}`,
                  borderLeft: `3px solid ${
                    entry.rank === 1 ? "#f59e0b"
                    : entry.rank === 2 ? "#94a3b8"
                    : entry.rank === 3 ? "#b45309"
                    : isMe ? "#22c55e"
                    : "#1e3a5f"
                  }`,
                  borderRadius: 2,
                  transition: "border-color 0.15s",
                }}
              >
                {/* Rang */}
                <span style={{
                  width: 28,
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: MEDAL_COLOR[entry.rank] || (isMe ? "#22c55e" : "#334155"),
                  textAlign: "center",
                  flexShrink: 0,
                }}>
                  {entry.rank <= 3 ? MEDAL[entry.rank] : `#${entry.rank}`}
                </span>

                {/* Username */}
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: isMe ? "#4ade80" : "#94a3b8",
                  fontWeight: isMe ? 700 : 400,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {entry.username}{isMe ? " (toi)" : ""}
                </span>

                {/* Steps */}
                <span style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#334155",
                  flexShrink: 0,
                }}>
                  {entry.completedSteps} steps
                </span>

                {/* XP */}
                <span style={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#f59e0b",
                  flexShrink: 0,
                  minWidth: 60,
                  textAlign: "right",
                }}>
                  {entry.totalXp} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
