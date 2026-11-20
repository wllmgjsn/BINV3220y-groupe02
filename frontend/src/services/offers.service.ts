import type { Offer } from "../models/offer.ts";
import type { PeriodCode } from "../models/offer.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isOfferList } from "../utils/guards.ts";

export const getOffers = async (
  token: string,
  signal?: AbortSignal,
  period?: PeriodCode,
  search?: string,
): Promise<Offer[]> => {
  const params = new URLSearchParams();
  if (search !== undefined) params.set("q", search);
  if (period !== undefined) params.set("period", period);
  const query = params.size === 0 ? "" : `?${params.toString()}`;
  const response = await fetch(`${API_URL}/offers${query}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferList, "Chargement des offres impossible");
};
