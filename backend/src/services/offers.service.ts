import { toOffer } from "../mappers/offer.mapper.ts";
import type { Offer } from "../models/offer.ts";
import type { PeriodCode } from "../models/offer.ts";
import type { User } from "../models/user.ts";
import type { OfferFilter, OffersRepository } from "../repositories/offers.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { hasContactRole, isAdmin, isStudent } from "./permissions.ts";

/**
 * Offres visibles selon le profil (CdC § 4) : toutes pour l'administrateur, les offres
 * publiées pour l'étudiant, les offres qu'il a déposées pour un déposant.
 */
const visibilityFilter = (viewer: User): OfferFilter => {
  if (isAdmin(viewer)) return {};
  if (isStudent(viewer)) return { status: "PUBLISHED" };
  if (hasContactRole(viewer, "DEPOSITOR")) return { depositorContactId: viewer.id };
  throw new HttpError(403, "FORBIDDEN", "Vous n'avez pas accès aux offres");
};

export const createOffersService = (repository: OffersRepository) => ({
  listOffers: (viewer: User, period?: PeriodCode): Offer[] =>
    repository.findAll({ ...visibilityFilter(viewer), period }).map(toOffer),
});

export type OffersService = ReturnType<typeof createOffersService>;
