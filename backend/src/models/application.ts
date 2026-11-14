export const APPLICATION_STATUSES = [
  "IN_PROGRESS",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationDbo {
  id: number;
  offer_id: number;
  offer_title: string;
  company_short_name: string;
  message: string | null;
  status: ApplicationStatus;
  applied_at: string;
}

export interface Application {
  id: number;
  offerId: number;
  offerTitle: string;
  companyShortName: string;
  message: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export type ApplicationDto = Application;
