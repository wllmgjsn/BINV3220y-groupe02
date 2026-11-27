import type { Offer } from "../models/offer.ts";
import type { PeriodCode } from "../models/offer.ts";
import { API_URL, ApiError, readJson } from "../utils/api.ts";
import { isOfferList } from "../utils/guards.ts";

const getApiErrorMessage = (value: unknown): string | undefined => {
  if (typeof value !== "object" || value === null || !("error" in value)) return undefined;
  const error = value.error;
  if (typeof error !== "object" || error === null || !("message" in error)) return undefined;
  return typeof error.message === "string" ? error.message : undefined;
};

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

export const removeOffer = async (token: string, offerId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/offers/${offerId}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  if (!response.ok) {
    const body: unknown = await response.json();
    const message =
      getApiErrorMessage(body) ?? `Suppression de l'offre impossible (statut ${response.status})`;
    throw new ApiError(response.status, message);
  }
};
