import type { CompanyStatus } from "../models/company.ts";
import type { OfferStatus, PeriodCode } from "../models/offer.ts";
import type { ContactRole, User, UserKind } from "../models/user.ts";

export type StatusTone = "success" | "warning" | "info" | "neutral";

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  ACTIVE: "Active",
  TO_VERIFY: "À vérifier",
  ARCHIVED: "Archivée",
};

export const COMPANY_STATUS_TONES: Record<CompanyStatus, StatusTone> = {
  ACTIVE: "success",
  TO_VERIFY: "warning",
  ARCHIVED: "neutral",
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  SUBMITTED: "Soumise",
  PENDING: "En attente",
  PUBLISHED: "Publiée",
  ASSIGNED: "Attribuée",
  ARCHIVED: "Archivée",
};

export const OFFER_STATUS_TONES: Record<OfferStatus, StatusTone> = {
  SUBMITTED: "warning",
  PENDING: "warning",
  PUBLISHED: "success",
  ASSIGNED: "info",
  ARCHIVED: "neutral",
};

export const PERIOD_LABELS: Record<PeriodCode, string> = {
  P1: "P1",
  P2: "P2",
  OTHER: "Autre",
};

export const USER_KIND_LABELS: Record<UserKind, string> = {
  ADMIN: "Administrateur",
  STUDENT: "Étudiant",
  CONTACT: "Contact d'entreprise",
};

export const USER_KIND_GROUP_LABELS: Record<UserKind, string> = {
  ADMIN: "Administrateurs",
  STUDENT: "Étudiants",
  CONTACT: "Contacts d'entreprise",
};

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  DEPOSITOR: "déposant",
  SIGNATORY: "signataire",
  PROMOTER: "promoteur",
};

export const fullName = (user: User): string => `${user.firstName} ${user.lastName}`;

/** Profil lisible, par exemple « Contact d'entreprise · déposant, promoteur ». */
export const profileLabel = (user: User): string => {
  const roles = user.roles.map((role) => CONTACT_ROLE_LABELS[role]).join(", ");
  return roles === "" ? USER_KIND_LABELS[user.kind] : `${USER_KIND_LABELS[user.kind]} · ${roles}`;
};
