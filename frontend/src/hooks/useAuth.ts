import { useCallback, useEffect, useState } from "react";
import type { User, UserKind } from "../models/user.ts";
import { demoLogin, getCurrentUser } from "../services/auth.service.ts";
import { isUnauthorized } from "../utils/api.ts";
import { clearToken, loadToken, saveToken } from "../utils/storage.ts";

/**
 * Session de l'utilisateur. À appeler une seule fois, dans App : chaque appel crée
 * un état indépendant.
 */
export const useAuth = () => {
  const [token, setToken] = useState<string | null>(loadToken);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Un jeton retrouvé dans le stockage doit être confirmé par le backend.
  useEffect(() => {
    if (token === null || user !== null) return;

    const controller = new AbortController();
    getCurrentUser(token, controller.signal)
      .then((currentUser) => {
        if (!controller.signal.aborted) setUser(currentUser);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) {
          logout();
        } else {
          setError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
      });

    return () => controller.abort();
  }, [token, user, logout]);

  const login = useCallback(async (kind: UserKind, id: number) => {
    const session = await demoLogin(kind, id);
    saveToken(session.token);
    setToken(session.token);
    setUser(session.user);
    setError(null);
  }, []);

  return {
    token,
    user,
    error,
    isLoading: token !== null && user === null && error === null,
    login,
    logout,
  };
};
