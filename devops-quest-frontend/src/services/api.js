/**
 * Service API — Fetch centralisé vers le backend
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("dq-token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error || `API ${res.status}`), { status: res.status });
  }
  return res.json();
}

// ── Parties & Stats ──────────────────────────────────────────────────────────
export const fetchParts = () => apiFetch("/api/parts");
export const fetchPartById = (id) => apiFetch(`/api/parts/${id}`);
export const fetchStats = () => apiFetch("/api/stats");
export const fetchHealth = () => apiFetch("/api/health");

// ── Auth ─────────────────────────────────────────────────────────────────────
export const register = (data) =>
  apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) });

export const login = (data) =>
  apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) });

export const fetchMe = () => apiFetch("/api/auth/me");

export const forgotPassword = (email) =>
  apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

export const resetPassword = (token, password) =>
  apiFetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });

// ── Progress ─────────────────────────────────────────────────────────────────
export const fetchProgress = () => apiFetch("/api/progress");

export const syncProgress = (completedSteps) =>
  apiFetch("/api/progress/sync", {
    method: "POST",
    body: JSON.stringify({ completedSteps }),
  });

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const fetchLeaderboard = () => apiFetch("/api/leaderboard");
