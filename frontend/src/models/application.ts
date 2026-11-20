export const APPLICATION_STATUSES = [
  "IN_PROGRESS",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id: number;
  offerId: number;
  offerTitle: string;
  companyShortName: string;
  message: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}
