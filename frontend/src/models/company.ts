export const COMPANY_STATUSES = ["ACTIVE", "TO_VERIFY", "ARCHIVED"] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export interface Company {
  id: number;
  name: string;
  shortName: string;
  locality: string;
  status: CompanyStatus;
}
