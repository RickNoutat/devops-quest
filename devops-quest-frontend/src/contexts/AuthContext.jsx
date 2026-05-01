/**
 * AuthContext — Gestion de la session utilisateur (JWT 7 jours)
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as apiLogin, register as apiRegister, fetchMe } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "dq-token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session au démarrage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await apiLogin({ email, password });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { token, user: u } = await apiRegister({ username, email, password });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
