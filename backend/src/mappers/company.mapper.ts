import type { Company, CompanyDbo, CompanyDto } from "../models/company.ts";

export const toCompany = (dbo: CompanyDbo): Company => ({
  id: dbo.id,
  name: dbo.name,
  shortName: dbo.short_name,
  address: dbo.address,
  locality: dbo.locality,
  status: dbo.status,
  parentCompanyId: dbo.parent_company_id,
});

export const toCompanyDto = (company: Company): CompanyDto => ({
  id: company.id,
  name: company.name,
  shortName: company.shortName,
  locality: company.locality,
  status: company.status,
});
