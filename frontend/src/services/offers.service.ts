import type { Offer } from "../models/offer.ts";
import type { PeriodCode } from "../models/offer.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isOfferList } from "../utils/guards.ts";

export const getOffers = async (
  token: string,
  signal?: AbortSignal,
  period?: PeriodCode,
): Promise<Offer[]> => {
  const query = period === undefined ? "" : `?period=${period}`;
  const response = await fetch(`${API_URL}/offers${query}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferList, "Chargement des offres impossible");
};
