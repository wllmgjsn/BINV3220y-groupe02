import type { User } from "../models/user.ts";

// Ces règles ne servent qu'à adapter l'interface (navigation, pages proposées).
// Elles ne protègent aucune donnée : le backend vérifie toujours les droits.

/** Même règle que le backend : administrateur, étudiant ou contact déposant. */
export const canListOffers = (user: User): boolean =>
  user.kind !== "CONTACT" || user.roles.includes("DEPOSITOR");
