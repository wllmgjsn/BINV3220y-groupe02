import { toCompany } from "../mappers/company.mapper.ts";
import type { Company } from "../models/company.ts";
import type { User } from "../models/user.ts";
import type { CompaniesRepository } from "../repositories/companies.repository.ts";
import { isAdmin } from "./permissions.ts";

export const createCompaniesService = (repository: CompaniesRepository) => ({
  /**
   * Un administrateur voit toutes les entreprises ; les autres utilisateurs ne voient que
   * les entreprises actives (ni archivées, ni « À vérifier »).
   */
  listCompanies: (viewer: User, search?: string): Company[] =>
    repository.findAll({ search, activeOnly: !isAdmin(viewer) }).map(toCompany),
});

export type CompaniesService = ReturnType<typeof createCompaniesService>;
