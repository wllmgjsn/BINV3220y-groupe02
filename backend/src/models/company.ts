export const COMPANY_STATUSES = ["ACTIVE", "TO_VERIFY", "ARCHIVED"] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

/** Ligne de la table companies, telle que SQLite la retourne. */
export interface CompanyDbo {
  id: number;
  name: string;
  short_name: string;
  address: string | null;
  locality: string;
  status: CompanyStatus;
  parent_company_id: number | null;
}

/** Entreprise manipulée par la logique métier. */
export interface Company {
  id: number;
  name: string;
  shortName: string;
  address: string | null;
  locality: string;
  status: CompanyStatus;
  parentCompanyId: number | null;
}

/** Entreprise exposée par l'API dans les listes. */
export interface CompanyDto {
  id: number;
  name: string;
  shortName: string;
  locality: string;
  status: CompanyStatus;
}
