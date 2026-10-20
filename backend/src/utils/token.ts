import jwt from "jsonwebtoken";
import { USER_KINDS, type TokenPayload } from "../models/user.ts";

const ALGORITHM = "HS256";
const TOKEN_LIFETIME = "8h";

const isTokenPayload = (value: unknown): value is TokenPayload => {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    (USER_KINDS as readonly unknown[]).includes(payload.kind) &&
    typeof payload.id === "number" &&
    Number.isInteger(payload.id)
  );
};

export const signToken = (payload: TokenPayload, secret: string): string =>
  jwt.sign({ kind: payload.kind, id: payload.id }, secret, {
    algorithm: ALGORITHM,
    expiresIn: TOKEN_LIFETIME,
  });

/** Retourne l'identité contenue dans un jeton valide, ou undefined. */
export const verifyToken = (token: string, secret: string): TokenPayload | undefined => {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: [ALGORITHM] });
    return isTokenPayload(decoded) ? { kind: decoded.kind, id: decoded.id } : undefined;
  } catch {
    // Jeton expiré, mal formé ou signé avec une autre clé : traité comme une absence de session.
    return undefined;
  }
};
