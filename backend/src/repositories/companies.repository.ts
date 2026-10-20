import type { Db } from "../db/database.ts";
import type { CompanyDbo } from "../models/company.ts";

export interface CompanyFilter {
  /** Texte cherché dans le nom complet ou abrégé. */
  search?: string;
  /** Limite le résultat aux entreprises actives. */
  activeOnly: boolean;
}

interface FindAllParams {
  pattern: string | null;
  activeOnly: 0 | 1;
}

// Neutralise les jokers de LIKE pour chercher le texte saisi tel quel.
const escapeLike = (text: string): string => text.replace(/[\\%_]/g, (char) => `\\${char}`);

export const createCompaniesRepository = (db: Db) => {
  const findAll = db.prepare<FindAllParams, CompanyDbo>(`
    SELECT id, name, short_name, address, locality, status, parent_company_id
    FROM companies
    WHERE (@pattern IS NULL OR name LIKE @pattern ESCAPE '\\' OR short_name LIKE @pattern ESCAPE '\\')
      AND (@activeOnly = 0 OR status = 'ACTIVE')
    ORDER BY name COLLATE NOCASE
  `);

  return {
    findAll: ({ search, activeOnly }: CompanyFilter): CompanyDbo[] =>
      findAll.all({
        pattern: search === undefined ? null : `%${escapeLike(search)}%`,
        activeOnly: activeOnly ? 1 : 0,
      }),
  };
};

export type CompaniesRepository = ReturnType<typeof createCompaniesRepository>;
