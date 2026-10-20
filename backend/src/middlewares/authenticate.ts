import type { Request, RequestHandler } from "express";
import type { User } from "../models/user.ts";
import type { AuthService } from "../services/auth.service.ts";
import { HttpError } from "../utils/httpError.ts";
import "../types/express.ts";

/** Refuse la requête (401) si le jeton de l'en-tête Authorization n'identifie personne. */
export const createAuthenticate =
  (authService: AuthService): RequestHandler =>
  (req, _res, next) => {
    req.user = authService.authenticate(req.get("Authorization"));
    next();
  };

/** Utilisateur courant d'une route placée derrière authenticate. */
export const getCurrentUser = (req: Request): User => {
  if (req.user === undefined) {
    throw new HttpError(401, "UNAUTHENTICATED", "Session absente, expirée ou invalide");
  }
  return req.user;
};
