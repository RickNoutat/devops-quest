/**
 * Tests unitaires — AuthContext (AuthProvider + useAuth)
 *
 * Couvre :
 *  - état initial (user null, loading true→false)
 *  - login : appel API, stockage token, user mis à jour
 *  - register : appel API, stockage token
 *  - logout : suppression token, user null
 *  - restauration de session au montage (token existant)
 *  - token invalide nettoyé au montage
 */

import { render, screen, act, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";

vi.mock("../../services/api", () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn(),
}));

const TOKEN = "fake-jwt-token";
const USER = { id: 1, username: "alice", email: "alice@test.com" };

// Composant de test qui expose l'état du contexte
function Inspector() {
  const { user, loading, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.username : "null"}</span>
      <button onClick={() => login("alice@test.com", "secret123")} data-testid="login-btn">login</button>
      <button onClick={() => register("alice", "alice@test.com", "secret123")} data-testid="register-btn">register</button>
      <button onClick={logout} data-testid="logout-btn">logout</button>
    </div>
  );
}

function setup() {
  return render(<AuthProvider><Inspector /></AuthProvider>);
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AuthProvider — état initial", () => {
  test("user est null si aucun token en localStorage", async () => {
    api.fetchMe.mockResolvedValue(USER);
    setup();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(api.fetchMe).not.toHaveBeenCalled();
  });

  test("restaure la session si un token valide est présent", async () => {
    localStorage.setItem("dq-token", TOKEN);
    api.fetchMe.mockResolvedValue(USER);
    setup();
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("alice"));
    expect(api.fetchMe).toHaveBeenCalledTimes(1);
  });

  test("supprime le token si fetchMe échoue (token invalide/expiré)", async () => {
    localStorage.setItem("dq-token", "expired-token");
    api.fetchMe.mockRejectedValue(new Error("Token invalide"));
    setup();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(localStorage.getItem("dq-token")).toBeNull();
    expect(screen.getByTestId("user").textContent).toBe("null");
  });
});

describe("AuthProvider — login", () => {
  test("appelle api.login avec email et password", async () => {
    api.fetchMe.mockResolvedValue(null);
    api.login.mockResolvedValue({ token: TOKEN, user: USER });
    setup();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    await act(async () => {
      screen.getByTestId("login-btn").click();
    });
    expect(api.login).toHaveBeenCalledWith({ email: "alice@test.com", password: "secret123" });
  });

  test("stocke le token dans localStorage après login", async () => {
    api.fetchMe.mockResolvedValue(null);
    api.login.mockResolvedValue({ token: TOKEN, user: USER });
    setup();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    await act(async () => { screen.getByTestId("login-btn").click(); });
    expect(localStorage.getItem("dq-token")).toBe(TOKEN);
  });

  test("met à jour user après login réussi", async () => {
    api.fetchMe.mockResolvedValue(null);
    api.login.mockResolvedValue({ token: TOKEN, user: USER });
    setup();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    await act(async () => { screen.getByTestId("login-btn").click(); });
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("alice"));
  });
});

describe("AuthProvider — register", () => {
  test("appelle api.register avec username, email, password", async () => {
    api.fetchMe.mockResolvedValue(null);
    api.register.mockResolvedValue({ token: TOKEN, user: USER });
    setup();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    await act(async () => { screen.getByTestId("register-btn").click(); });
    expect(api.register).toHaveBeenCalledWith({ username: "alice", email: "alice@test.com", password: "secret123" });
  });

  test("stocke le token et met à jour user après register", async () => {
    api.fetchMe.mockResolvedValue(null);
    api.register.mockResolvedValue({ token: TOKEN, user: USER });
    setup();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    await act(async () => { screen.getByTestId("register-btn").click(); });
    await waitFor(() => {
      expect(localStorage.getItem("dq-token")).toBe(TOKEN);
      expect(screen.getByTestId("user").textContent).toBe("alice");
    });
  });
});

describe("AuthProvider — logout", () => {
  test("supprime le token et remet user à null", async () => {
    localStorage.setItem("dq-token", TOKEN);
    api.fetchMe.mockResolvedValue(USER);
    setup();
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("alice"));

    await act(async () => { screen.getByTestId("logout-btn").click(); });
    expect(localStorage.getItem("dq-token")).toBeNull();
    expect(screen.getByTestId("user").textContent).toBe("null");
  });
});
