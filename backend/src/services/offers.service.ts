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
  listOffers: (viewer: User, period?: PeriodCode, search?: string): Offer[] =>
    repository.findAll({ ...visibilityFilter(viewer), period, search }).map(toOffer),

  removeOffer: (viewer: User, offerId: number): void => {
    if (!isAdmin(viewer) && !hasContactRole(viewer, "DEPOSITOR")) {
      throw new HttpError(403, "FORBIDDEN", "Vous n'avez pas le droit de retirer cette offre");
    }

    const result = repository.remove(
      offerId,
      isAdmin(viewer) ? { kind: "ADMIN" } : { kind: "DEPOSITOR", contactId: viewer.id },
    );
    if (result === "NOT_FOUND") {
      throw new HttpError(404, "OFFER_NOT_FOUND", "Offre introuvable");
    }
    if (result === "FORBIDDEN") {
      throw new HttpError(403, "FORBIDDEN", "Vous n'avez pas le droit de retirer cette offre");
    }
    if (result === "NOT_REMOVABLE") {
      throw new HttpError(
        409,
        "OFFER_NOT_REMOVABLE",
        "Vous ne pouvez retirer une offre que tant qu'elle n'est pas publiée",
      );
    }
    if (result === "HAS_INTERNSHIP") {
      throw new HttpError(
        409,
        "OFFER_HAS_INTERNSHIP",
        "Cette offre est liée à un stage et ne peut pas être supprimée",
      );
    }
  },
});

export type OffersService = ReturnType<typeof createOffersService>;
