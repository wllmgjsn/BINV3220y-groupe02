import type { RequestHandler } from "express";
import type { User } from "../models/user.ts";
import { HttpError } from "../utils/httpError.ts";
import { getCurrentUser } from "./authenticate.ts";

/**
 * Refuse la requête (403) si l'utilisateur connecté ne respecte pas la règle.
 * À placer après authenticate, par exemple : router.get("/", authorize(canListOffers), …).
 */
export const authorize =
  (isAllowed: (user: User) => boolean): RequestHandler =>
  (req, _res, next) => {
    if (!isAllowed(getCurrentUser(req))) {
      throw new HttpError(403, "FORBIDDEN", "Vous n'avez pas accès à cette ressource");
    }
    next();
  };
