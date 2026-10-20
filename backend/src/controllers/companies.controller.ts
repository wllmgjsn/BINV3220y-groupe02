import { Router } from "express";
import { toCompanyDto } from "../mappers/company.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { CompaniesService } from "../services/companies.service.ts";
import { HttpError } from "../utils/httpError.ts";

const MAX_SEARCH_LENGTH = 100;

/** Valide le paramètre ?q= : texte facultatif, ignoré s'il est vide. */
const parseSearch = (value: unknown): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_QUERY", "Le paramètre q doit apparaître une seule fois");
  }
  if (value.length > MAX_SEARCH_LENGTH) {
    throw new HttpError(
      400,
      "INVALID_QUERY",
      `Le paramètre q ne peut pas dépasser ${MAX_SEARCH_LENGTH} caractères`,
    );
  }

  const search = value.trim();
  return search === "" ? undefined : search;
};

export const createCompaniesRouter = (companiesService: CompaniesService) => {
  const router = Router();

  router.get("/", (req, res) => {
    const search = parseSearch(req.query.q);
    const companies = companiesService.listCompanies(getCurrentUser(req), search);
    res.json(companies.map(toCompanyDto));
  });

  return router;
};
