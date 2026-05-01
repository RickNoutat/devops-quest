/**
 * Tests de composant — Header
 *
 * Couvre :
 *  - affichage du logo DEVOPS_QUEST
 *  - affichage XP et progression steps
 *  - barre de progression correctement remplie
 *  - bouton [ login ] visible si non connecté
 *  - username et bouton logout visibles si connecté
 *  - bouton ▲ TOP toujours visible
 *  - callbacks onLoginClick et onLeaderboardClick
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import Header from "../../components/Header";

const mockAuthValue = { user: null, logout: vi.fn() };

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

const defaultStats = { totalSteps: 10, totalXP: 500 };

function setup({ stats = defaultStats, userXP = 0, completedCount = 0, onLoginClick = vi.fn(), onLeaderboardClick = vi.fn() } = {}) {
  return {
    onLoginClick,
    onLeaderboardClick,
    ...render(
      <Header
        stats={stats}
        userXP={userXP}
        completedCount={completedCount}
        onLoginClick={onLoginClick}
        onLeaderboardClick={onLeaderboardClick}
      />
    ),
  };
}

beforeEach(() => {
  mockAuthValue.user = null;
  mockAuthValue.logout = vi.fn();
  vi.clearAllMocks();
});

// ── Rendu ─────────────────────────────────────────────────────────────────────

describe("Header — rendu de base", () => {
  test("affiche le titre DEVOPS_QUEST", () => {
    setup();
    expect(screen.getByText("DEVOPS_QUEST")).toBeInTheDocument();
  });

  test("affiche le XP de l'utilisateur (userXP)", () => {
    setup({ userXP: 250 });
    expect(screen.getByText("250")).toBeInTheDocument();
  });

  test("affiche le compteur steps complétés/total", () => {
    setup({ completedCount: 3 });
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  test("affiche 0/0 quand les stats sont null", () => {
    setup({ stats: null, completedCount: 0 });
    expect(screen.getByText("0/0")).toBeInTheDocument();
  });
});

// ── Progression ───────────────────────────────────────────────────────────────

describe("Header — barre de progression", () => {
  test("affiche 0% quand aucun step complété", () => {
    setup({ completedCount: 0 });
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  test("affiche 100% quand tous les steps sont complétés", () => {
    setup({ completedCount: 10 });
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  test("affiche 50% quand la moitié est complétée", () => {
    setup({ completedCount: 5 });
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});

// ── Auth — non connecté ───────────────────────────────────────────────────────

describe("Header — non connecté", () => {
  test("affiche le bouton [ login ]", () => {
    setup();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test("n'affiche pas de bouton logout", () => {
    setup();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  test("cliquer sur [ login ] appelle onLoginClick", () => {
    const { onLoginClick } = setup();
    fireEvent.click(screen.getByText(/login/i));
    expect(onLoginClick).toHaveBeenCalledTimes(1);
  });
});

// ── Auth — connecté ───────────────────────────────────────────────────────────

describe("Header — connecté", () => {
  beforeEach(() => {
    mockAuthValue.user = { id: 1, username: "alice" };
  });

  test("affiche le username de l'utilisateur connecté", () => {
    setup();
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  test("affiche le bouton logout", () => {
    setup();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  test("n'affiche pas le bouton [ login ] quand connecté", () => {
    setup();
    expect(screen.queryByText(/\[ login \]/i)).not.toBeInTheDocument();
  });

  test("cliquer sur logout appelle auth.logout", () => {
    setup();
    fireEvent.click(screen.getByText(/logout/i));
    expect(mockAuthValue.logout).toHaveBeenCalledTimes(1);
  });
});

// ── Leaderboard ───────────────────────────────────────────────────────────────

describe("Header — bouton leaderboard", () => {
  test("le bouton ▲ TOP est toujours visible", () => {
    setup();
    expect(screen.getByText(/TOP/i)).toBeInTheDocument();
  });

  test("cliquer sur ▲ TOP appelle onLeaderboardClick", () => {
    const { onLeaderboardClick } = setup();
    fireEvent.click(screen.getByText(/TOP/i));
    expect(onLeaderboardClick).toHaveBeenCalledTimes(1);
  });
});
