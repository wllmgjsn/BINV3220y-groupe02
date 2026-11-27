import { Router } from "express";
import { toOfferDto } from "../mappers/offer.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import type { PeriodCode } from "../models/offer.ts";
import type { OffersService } from "../services/offers.service.ts";
import { canListOffers } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const isPeriodCode = (value: unknown): value is PeriodCode =>
  value === "P1" || value === "P2" || value === "OTHER";

const MAX_SEARCH_LENGTH = 100;

const parseId = (value: string): number => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, "INVALID_ID", "offerId doit être un identifiant valide");
  }
  return id;
};

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

const parsePeriod = (value: unknown): PeriodCode | undefined => {
  if (value === undefined) return undefined;
  if (!isPeriodCode(value)) {
    throw new HttpError(400, "INVALID_QUERY", "Le paramètre period doit être P1, P2 ou OTHER");
  }
  return value;
};

export const createOffersRouter = (offersService: OffersService) => {
  const router = Router();

  router.get("/", authorize(canListOffers), (req, res) => {
    const period = parsePeriod(req.query.period);
    const search = parseSearch(req.query.q);
    res.json(offersService.listOffers(getCurrentUser(req), period, search).map(toOfferDto));
  });

  router.delete("/:offerId", (req, res) => {
    offersService.removeOffer(getCurrentUser(req), parseId(req.params.offerId));
    res.status(204).end();
  });

  return router;
};
