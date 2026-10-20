import type { Offer, OfferDbo, OfferDto } from "../models/offer.ts";

export const toOffer = (dbo: OfferDbo): Offer => ({
  id: dbo.id,
  title: dbo.title,
  description: dbo.description,
  status: dbo.status,
  company: { id: dbo.company_id, shortName: dbo.company_short_name },
  depositorContactId: dbo.depositor_contact_id,
  academicYear: dbo.academic_year_label,
  period: dbo.period_code,
  createdAt: dbo.created_at,
  updatedAt: dbo.updated_at,
});

export const toOfferDto = (offer: Offer): OfferDto => ({
  id: offer.id,
  title: offer.title,
  companyShortName: offer.company.shortName,
  academicYear: offer.academicYear,
  period: offer.period,
  status: offer.status,
});
