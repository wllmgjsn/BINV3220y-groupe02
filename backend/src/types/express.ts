import type { User } from "../models/user.ts";

// Ajoute à la requête Express l'utilisateur identifié par le middleware authenticate.
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
