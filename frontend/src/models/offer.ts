export const OFFER_STATUSES = ["SUBMITTED", "PENDING", "PUBLISHED", "ASSIGNED", "ARCHIVED"] as const;

export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const PERIOD_CODES = ["P1", "P2", "OTHER"] as const;

export type PeriodCode = (typeof PERIOD_CODES)[number];

export interface Offer {
  id: number;
  title: string;
  companyShortName: string;
  academicYear: string;
  period: PeriodCode;
  status: OfferStatus;
}
