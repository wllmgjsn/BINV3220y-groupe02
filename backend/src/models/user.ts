export const USER_KINDS = ["ADMIN", "STUDENT", "CONTACT"] as const;

export type UserKind = (typeof USER_KINDS)[number];

export const CONTACT_ROLES = ["DEPOSITOR", "SIGNATORY", "PROMOTER"] as const;

export type ContactRole = (typeof CONTACT_ROLES)[number];

export type AccountStatus = "ACTIVE" | "TO_VERIFY" | "INACTIVE";

/** Ligne commune aux tables administrators, students et contacts. */
export interface PersonDbo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: AccountStatus;
}

export interface ContactRoleDbo {
  role: ContactRole;
}

export interface CompanySummaryDbo {
  id: number;
  short_name: string;
}

/**
 * Données brutes d'un utilisateur, telles que le repository les lit : sa ligne et,
 * pour un contact, ses rôles et ses entreprises (vides sinon).
 */
export interface UserDbo {
  kind: UserKind;
  person: PersonDbo;
  roles: ContactRoleDbo[];
  companies: CompanySummaryDbo[];
}

export interface CompanySummary {
  id: number;
  shortName: string;
}

/**
 * Utilisateur reconnu par le backend. Ses rôles et ses entreprises sont toujours
 * relus en base : ils ne proviennent jamais du client.
 */
export interface User {
  kind: UserKind;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  /** Rôles d'un contact ; vide pour un administrateur ou un étudiant. */
  roles: ContactRole[];
  /** Entreprises d'un contact ; vide pour un administrateur ou un étudiant. */
  companies: CompanySummary[];
}

/** Utilisateur exposé par l'API : seuls ces champs quittent le backend. */
export interface UserDto {
  kind: UserKind;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: ContactRole[];
  companies: { id: number; shortName: string }[];
}

/** Contenu du jeton : uniquement l'identité, jamais les droits. */
export interface TokenPayload {
  kind: UserKind;
  id: number;
}
