import { useEffect, useState } from "react";
import type { Offer, PeriodCode } from "../models/offer.ts";
import { getOffers } from "../services/offers.service.ts";
import { isUnauthorized } from "../utils/api.ts";

/**
 * Offres visibles par l'utilisateur, choisies par le backend selon son profil.
 * onUnauthorized doit être stable (useCallback) pour ne pas relancer le chargement.
 */
export const useOffers = (
  token: string,
  onUnauthorized: () => void,
  period?: PeriodCode,
) => {
  const [result, setResult] = useState<{
    token: string;
    period: PeriodCode | undefined;
    offers: Offer[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getOffers(token, controller.signal, period)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ token, period, offers: data, error: null });
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setResult({
            token,
            period,
            offers: [],
            error: reason instanceof Error ? reason.message : "Erreur inconnue",
          });
        }
      });

    return () => controller.abort();
  }, [token, onUnauthorized, period]);

  const currentResult =
    result?.token === token && result.period === period ? result : null;
  return {
    offers: currentResult?.offers ?? [],
    isLoading: currentResult === null,
    error: currentResult?.error ?? null,
  };
};
