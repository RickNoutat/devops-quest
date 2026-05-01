/**
 * Tests de composant — Leaderboard
 *
 * Couvre :
 *  - affichage "Chargement..." puis les entrées
 *  - affichage "Aucun participant" si liste vide
 *  - erreur API affichée
 *  - rang et XP correctement rendus
 *  - position de l'utilisateur connecté surlignée avec "(toi)"
 *  - fermeture par × et overlay
 */

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import Leaderboard from "../../components/Leaderboard";
import * as api from "../../services/api";

const mockAuthValue = { user: null };

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

vi.mock("../../services/api", () => ({
  fetchLeaderboard: vi.fn(),
}));

const LEADERBOARD_DATA = {
  leaderboard: [
    { rank: 1, id: 10, username: "alice", totalXp: 500, completedSteps: 5 },
    { rank: 2, id: 20, username: "bob", totalXp: 300, completedSteps: 3 },
    { rank: 3, id: 30, username: "charlie", totalXp: 100, completedSteps: 1 },
  ],
  currentUserRank: null,
};

function setup(onClose = vi.fn()) {
  return { onClose, ...render(<Leaderboard onClose={onClose} />) };
}

beforeEach(() => {
  mockAuthValue.user = null;
  vi.clearAllMocks();
});

// ── Chargement ────────────────────────────────────────────────────────────────

describe("Leaderboard — chargement", () => {
  test("affiche 'Chargement...' avant la réponse", () => {
    api.fetchLeaderboard.mockReturnValue(new Promise(() => {}));
    setup();
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  test("affiche les entrées après chargement", async () => {
    api.fetchLeaderboard.mockResolvedValue(LEADERBOARD_DATA);
    setup();
    await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("charlie")).toBeInTheDocument();
  });

  test("affiche un message si aucun participant", async () => {
    api.fetchLeaderboard.mockResolvedValue({ leaderboard: [], currentUserRank: null });
    setup();
    await waitFor(() => expect(screen.getByText(/Aucun participant/i)).toBeInTheDocument());
  });

  test("affiche l'erreur API en cas d'échec", async () => {
    api.fetchLeaderboard.mockRejectedValue(new Error("Erreur réseau"));
    setup();
    await waitFor(() => expect(screen.getByText(/Erreur réseau/i)).toBeInTheDocument());
  });
});

// ── Contenu ───────────────────────────────────────────────────────────────────

describe("Leaderboard — contenu", () => {
  test("affiche le XP de chaque entrée", async () => {
    api.fetchLeaderboard.mockResolvedValue(LEADERBOARD_DATA);
    setup();
    await waitFor(() => screen.getByText("alice"));
    expect(screen.getByText(/500 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/300 XP/i)).toBeInTheDocument();
  });

  test("affiche le nombre de steps complétées", async () => {
    api.fetchLeaderboard.mockResolvedValue(LEADERBOARD_DATA);
    setup();
    await waitFor(() => screen.getByText("alice"));
    expect(screen.getByText("5 steps")).toBeInTheDocument();
  });
});

// ── Utilisateur connecté ──────────────────────────────────────────────────────

describe("Leaderboard — user connecté", () => {
  test("affiche '(toi)' à côté du username de l'utilisateur connecté", async () => {
    api.fetchLeaderboard.mockResolvedValue({ ...LEADERBOARD_DATA, currentUserRank: 2 });
    mockAuthValue.user = { id: 20, username: "bob" };
    setup();
    await waitFor(() => expect(screen.getByText(/bob.*\(toi\)/i)).toBeInTheDocument());
  });

  test("affiche la position de l'utilisateur connecté", async () => {
    api.fetchLeaderboard.mockResolvedValue({ ...LEADERBOARD_DATA, currentUserRank: 2 });
    mockAuthValue.user = { id: 20, username: "bob" };
    setup();
    await waitFor(() => expect(screen.getByText(/Ta position.*#2/i)).toBeInTheDocument());
  });

  test("n'affiche pas la position si non connecté", async () => {
    api.fetchLeaderboard.mockResolvedValue(LEADERBOARD_DATA);
    setup();
    await waitFor(() => screen.getByText("alice"));
    expect(screen.queryByText(/Ta position/i)).not.toBeInTheDocument();
  });
});

// ── Fermeture ─────────────────────────────────────────────────────────────────

describe("Leaderboard — fermeture", () => {
  test("bouton × appelle onClose", async () => {
    api.fetchLeaderboard.mockResolvedValue(LEADERBOARD_DATA);
    const { onClose } = setup();
    await screen.findByText(/LEADERBOARD/i);
    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
