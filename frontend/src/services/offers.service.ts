import type { Offer } from "../models/offer.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isOfferList } from "../utils/guards.ts";

export const getOffers = async (token: string, signal?: AbortSignal): Promise<Offer[]> => {
  const response = await fetch(`${API_URL}/offers`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferList, "Chargement des offres impossible");
};
