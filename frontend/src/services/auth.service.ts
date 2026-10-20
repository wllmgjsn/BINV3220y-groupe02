import type { Session, User, UserKind } from "../models/user.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isSession, isUser, isUserList } from "../utils/guards.ts";

export const getDemoUsers = async (signal?: AbortSignal): Promise<User[]> => {
  const response = await fetch(`${API_URL}/auth/demo-users`, { signal });
  return readJson(response, isUserList, "Chargement des utilisateurs de démo impossible");
};

export const demoLogin = async (kind: UserKind, id: number): Promise<Session> => {
  const response = await fetch(`${API_URL}/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id }),
  });
  return readJson(response, isSession, "Connexion impossible");
};

export const getCurrentUser = async (token: string, signal?: AbortSignal): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isUser, "Vérification de la session impossible");
};
