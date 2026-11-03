import type { Application, ApplicationDbo, ApplicationDto } from "../models/application.ts";

export const toApplication = (row: ApplicationDbo): Application => ({
  id: row.id,
  offerId: row.offer_id,
  offerTitle: row.offer_title,
  companyShortName: row.company_short_name,
  message: row.message,
  status: row.status,
  appliedAt: row.applied_at,
});

export const toApplicationDto = (application: Application): ApplicationDto => application;
