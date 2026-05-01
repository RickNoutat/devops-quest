/**
 * Tests de composant — AuthModal
 *
 * Couvre :
 *  - rendu initial (mode login)
 *  - switch vers l'onglet "S'inscrire"
 *  - soumission login : appel login, fermeture modale
 *  - soumission register : champs username visibles, appel register
 *  - affichage d'une erreur API
 *  - fermeture par le bouton ×
 *  - fermeture en cliquant sur l'overlay
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, test, expect, beforeEach } from "vitest";
import AuthModal from "../../components/AuthModal";
import { AuthProvider } from "../../contexts/AuthContext";
import * as api from "../../services/api";

vi.mock("../../services/api", () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn(),
}));

function setup(onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <AuthProvider>
        <AuthModal onClose={onClose} />
      </AuthProvider>
    ),
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  api.fetchMe.mockResolvedValue(null);
});

// ── Rendu ─────────────────────────────────────────────────────────────────────

describe("AuthModal — rendu", () => {
  test("affiche le titre // LOGIN par défaut", async () => {
    setup();
    expect(await screen.findByText(/LOGIN/i)).toBeInTheDocument();
  });

  test("affiche les onglets SE CONNECTER et S'INSCRIRE", async () => {
    setup();
    expect(await screen.findByText(/SE CONNECTER/i)).toBeInTheDocument();
    expect(screen.getByText(/S'INSCRIRE/i)).toBeInTheDocument();
  });

  test("le champ username n'est pas visible en mode login", async () => {
    setup();
    await screen.findByText(/LOGIN/i);
    expect(screen.queryByPlaceholderText("ton_pseudo")).not.toBeInTheDocument();
  });
});

// ── Switch de mode ────────────────────────────────────────────────────────────

describe("AuthModal — switch de mode", () => {
  test("cliquer sur S'INSCRIRE affiche le champ username", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(await screen.findByText(/S'INSCRIRE/i));
    expect(screen.getByPlaceholderText("ton_pseudo")).toBeInTheDocument();
  });

  test("cliquer sur S'INSCRIRE change le titre en // REGISTER", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(await screen.findByText(/S'INSCRIRE/i));
    expect(await screen.findByText(/REGISTER/i)).toBeInTheDocument();
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

describe("AuthModal — login", () => {
  test("appelle login avec email et password saisis", async () => {
    api.login.mockResolvedValue({ token: "tok", user: { id: 1, username: "alice" } });
    const user = userEvent.setup();
    const { onClose } = setup();

    await user.type(await screen.findByPlaceholderText("toi@example.com"), "alice@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByText(/CONNEXION/i));

    await waitFor(() => expect(api.login).toHaveBeenCalledWith({ email: "alice@test.com", password: "secret123" }));
  });

  test("ferme la modale après un login réussi", async () => {
    api.login.mockResolvedValue({ token: "tok", user: { id: 1, username: "alice" } });
    const user = userEvent.setup();
    const { onClose } = setup();

    await user.type(await screen.findByPlaceholderText("toi@example.com"), "alice@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret");
    await user.click(screen.getByText(/CONNEXION/i));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test("affiche l'erreur API en cas d'échec", async () => {
    api.login.mockRejectedValue(new Error("Email ou mot de passe incorrect"));
    const user = userEvent.setup();
    setup();

    await user.type(await screen.findByPlaceholderText("toi@example.com"), "x@x.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "bad");
    await user.click(screen.getByText(/CONNEXION/i));

    await waitFor(() => expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument());
  });
});

// ── Register ──────────────────────────────────────────────────────────────────

describe("AuthModal — register", () => {
  test("appelle register avec username, email et password", async () => {
    api.register.mockResolvedValue({ token: "tok", user: { id: 2, username: "bob" } });
    const user = userEvent.setup();
    setup();

    await user.click(await screen.findByText(/S'INSCRIRE/i));
    await user.type(screen.getByPlaceholderText("ton_pseudo"), "bob");
    await user.type(screen.getByPlaceholderText("toi@example.com"), "bob@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByText(/CRÉER LE COMPTE/i));

    await waitFor(() => expect(api.register).toHaveBeenCalledWith({ username: "bob", email: "bob@test.com", password: "secret123" }));
  });
});

// ── Fermeture ─────────────────────────────────────────────────────────────────

describe("AuthModal — fermeture", () => {
  test("bouton × appelle onClose", async () => {
    const { onClose } = setup();
    await screen.findByText(/LOGIN/i);
    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("cliquer sur l'overlay appelle onClose", async () => {
    const { onClose } = setup();
    await screen.findByText(/LOGIN/i);
    // L'overlay est le premier div (position:fixed)
    const overlay = screen.getByText(/LOGIN/i).closest("[style*='position: fixed']");
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
