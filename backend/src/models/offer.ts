export const OFFER_STATUSES = ["SUBMITTED", "PENDING", "PUBLISHED", "ASSIGNED", "ARCHIVED"] as const;

export type OfferStatus = (typeof OFFER_STATUSES)[number];

export type PeriodCode = "P1" | "P2" | "OTHER";

/** Offre lue avec son entreprise, son année et sa période (jointures SQL). */
export interface OfferDbo {
  id: number;
  title: string;
  description: string;
  status: OfferStatus;
  company_id: number;
  company_short_name: string;
  depositor_contact_id: number | null;
  academic_year_label: string;
  period_code: PeriodCode;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  status: OfferStatus;
  company: { id: number; shortName: string };
  depositorContactId: number | null;
  academicYear: string;
  period: PeriodCode;
  createdAt: string;
  updatedAt: string;
}

/** Offre exposée par l'API dans les listes. */
export interface OfferDto {
  id: number;
  title: string;
  companyShortName: string;
  academicYear: string;
  period: PeriodCode;
  status: OfferStatus;
}
