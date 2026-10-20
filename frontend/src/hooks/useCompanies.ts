import { useEffect, useState } from "react";
import type { Company } from "../models/company.ts";
import { getCompanies } from "../services/companies.service.ts";
import { isUnauthorized } from "../utils/api.ts";

// Délai avant d'interroger l'API pendant la frappe d'une recherche.
const SEARCH_DELAY_MS = 300;

/**
 * Entreprises visibles par l'utilisateur. onUnauthorized est appelé si la session
 * a expiré ; il doit être stable (useCallback) pour ne pas relancer le chargement.
 */
export const useCompanies = (token: string, search: string, onUnauthorized: () => void) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = () => {
      setIsLoading(true);
      setError(null);
      getCompanies(token, search, controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) setCompanies(data);
        })
        .catch((reason: unknown) => {
          if (controller.signal.aborted) return;
          if (isUnauthorized(reason)) {
            onUnauthorized();
          } else {
            setError(reason instanceof Error ? reason.message : "Erreur inconnue");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    };

    const timeoutId = window.setTimeout(load, search === "" ? 0 : SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [token, search, onUnauthorized]);

  return { companies, isLoading, error };
};
