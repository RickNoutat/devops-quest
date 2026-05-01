/**
 * Tests unitaires — hook useCompletion
 *
 * Couvre :
 *  - initialisation depuis localStorage (user déconnecté)
 *  - toggle ajoute/retire un step
 *  - persistance dans localStorage
 *  - chargement depuis l'API quand un user se connecte
 *  - sync vers l'API au toggle quand connecté
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import useCompletion from "../../hooks/useCompletion";
import * as api from "../../services/api";

// ── Mock AuthContext ──────────────────────────────────────────────────────────

const mockAuthValue = { user: null };

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

// ── Mock API ──────────────────────────────────────────────────────────────────

vi.mock("../../services/api", () => ({
  fetchProgress: vi.fn(),
  syncProgress: vi.fn(),
}));

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  mockAuthValue.user = null;
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useCompletion — mode non connecté (localStorage)", () => {
  test("initialise avec un tableau vide si localStorage vide", () => {
    const { result } = renderHook(() => useCompletion());
    expect(result.current.completedSteps).toEqual([]);
  });

  test("initialise depuis localStorage si des steps existent", () => {
    localStorage.setItem("devops-quest-completed", JSON.stringify(["1-1", "1-2"]));
    const { result } = renderHook(() => useCompletion());
    expect(result.current.completedSteps).toEqual(["1-1", "1-2"]);
  });

  test("toggle ajoute un step non présent", () => {
    const { result } = renderHook(() => useCompletion());
    act(() => { result.current.toggle("1-1"); });
    expect(result.current.completedSteps).toContain("1-1");
  });

  test("toggle retire un step déjà présent", () => {
    localStorage.setItem("devops-quest-completed", JSON.stringify(["1-1"]));
    const { result } = renderHook(() => useCompletion());
    act(() => { result.current.toggle("1-1"); });
    expect(result.current.completedSteps).not.toContain("1-1");
  });

  test("toggle est idempotent en double appel (add→remove)", () => {
    const { result } = renderHook(() => useCompletion());
    act(() => { result.current.toggle("1-1"); });
    act(() => { result.current.toggle("1-1"); });
    expect(result.current.completedSteps).toHaveLength(0);
  });

  test("le localStorage est mis à jour après un toggle", async () => {
    const { result } = renderHook(() => useCompletion());
    act(() => { result.current.toggle("1-1"); });
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("devops-quest-completed") || "[]");
      expect(stored).toContain("1-1");
    });
  });

  test("ne fait pas appel à l'API quand déconnecté", () => {
    renderHook(() => useCompletion());
    expect(api.fetchProgress).not.toHaveBeenCalled();
    expect(api.syncProgress).not.toHaveBeenCalled();
  });
});

describe("useCompletion — mode connecté (sync API)", () => {
  test("charge la progression distante à la connexion", async () => {
    api.fetchProgress.mockResolvedValue({ completedSteps: ["1-1", "2-3"] });
    mockAuthValue.user = { id: 42, username: "alice" };

    const { result } = renderHook(() => useCompletion());
    await waitFor(() => {
      expect(result.current.completedSteps).toEqual(["1-1", "2-3"]);
    });
    expect(api.fetchProgress).toHaveBeenCalledTimes(1);
  });

  test("syncProgress est appelé après un toggle (avec debounce)", async () => {
    api.fetchProgress.mockResolvedValue({ completedSteps: [] });
    api.syncProgress.mockResolvedValue({ ok: true });
    mockAuthValue.user = { id: 42, username: "alice" };

    const { result } = renderHook(() => useCompletion());
    await waitFor(() => expect(api.fetchProgress).toHaveBeenCalled());

    act(() => { result.current.toggle("1-1"); });
    await waitFor(() => {
      expect(api.syncProgress).toHaveBeenCalledWith(expect.arrayContaining(["1-1"]));
    }, { timeout: 1000 });
  });

  test("une erreur fetchProgress ne fait pas crasher le hook", async () => {
    api.fetchProgress.mockRejectedValue(new Error("Network error"));
    mockAuthValue.user = { id: 42, username: "alice" };

    const { result } = renderHook(() => useCompletion());
    await waitFor(() => expect(api.fetchProgress).toHaveBeenCalled());
    // Le hook ne doit pas lever d'erreur
    expect(result.current.completedSteps).toBeDefined();
  });
});
