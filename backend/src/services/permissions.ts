import type { ContactRole, User } from "../models/user.ts";

// Règles d'accès du CdC (§ 4), indépendantes d'Express. Les contrôleurs les appliquent
// avec le middleware authorize ; les services s'en servent pour filtrer les données.

export const isAdmin = (user: User): boolean => user.kind === "ADMIN";

export const isStudent = (user: User): boolean => user.kind === "STUDENT";

/** Les rôles d'un contact s'exercent dans toutes ses entreprises. */
export const hasContactRole = (user: User, role: ContactRole): boolean =>
  user.kind === "CONTACT" && user.roles.includes(role);

/**
 * Consulter des offres : l'administrateur, l'étudiant et le déposant. Un contact
 * seulement promoteur ou signataire n'y a pas accès.
 */
export const canListOffers = (user: User): boolean =>
  isAdmin(user) || isStudent(user) || hasContactRole(user, "DEPOSITOR");
