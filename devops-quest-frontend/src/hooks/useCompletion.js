/**
 * Hook useCompletion — Gère la progression
 * - Connecté  : synchronisation avec l'API (source de vérité = serveur)
 * - Déconnecté : stockage local (localStorage)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchProgress, syncProgress } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const LOCAL_KEY = "devops-quest-completed";

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
  catch { return []; }
}

export default function useCompletion() {
  const { user } = useAuth();
  const [completedSteps, setCompletedSteps] = useState(loadLocal);
  const syncTimer = useRef(null);
  const prevUserId = useRef(null);

  // Quand l'utilisateur se connecte → charger sa progression depuis l'API
  useEffect(() => {
    if (!user) {
      if (prevUserId.current !== null) {
        setCompletedSteps(loadLocal());
      }
      prevUserId.current = null;
      return;
    }

    if (prevUserId.current === user.id) return;
    prevUserId.current = user.id;

    fetchProgress()
      .then(({ completedSteps: remote }) => {
        setCompletedSteps(remote);
      })
      .catch(() => {
        // En cas d'erreur réseau, on garde les données locales
      });
  }, [user]);

  // Sync vers l'API avec debounce (500 ms) quand connecté, sinon localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(completedSteps));
      return;
    }

    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncProgress(completedSteps).catch(() => {});
    }, 500);

    return () => clearTimeout(syncTimer.current);
  }, [completedSteps, user]);

  const toggle = useCallback((stepId) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  }, []);

  return { completedSteps, toggle };
}
