export const USER_KINDS = ["ADMIN", "STUDENT", "CONTACT"] as const;

export type UserKind = (typeof USER_KINDS)[number];

export const CONTACT_ROLES = ["DEPOSITOR", "SIGNATORY", "PROMOTER"] as const;

export type ContactRole = (typeof CONTACT_ROLES)[number];

export interface CompanySummary {
  id: number;
  shortName: string;
}

export interface User {
  kind: UserKind;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: ContactRole[];
  companies: CompanySummary[];
}

/** Réponse de la connexion de démo. */
export interface Session {
  token: string;
  user: User;
}
