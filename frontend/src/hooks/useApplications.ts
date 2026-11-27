import { useCallback, useEffect, useState } from "react";
import type { Application } from "../models/application.ts";
import { getApplications } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

export const useApplications = (
  token: string,
  onUnauthorized: () => void,
  enabled = true,
) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    token: string;
    applications: Application[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    getApplications(token, controller.signal)
      .then((applications) => {
        if (!controller.signal.aborted) setResult({ token, applications, error: null });
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setResult({
            token,
            applications: [],
            error: reason instanceof Error ? reason.message : "Erreur inconnue",
          });
        }
      });

    return () => controller.abort();
  }, [token, onUnauthorized, enabled, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const currentResult = result?.token === token ? result : null;
  return {
    applications: enabled ? (currentResult?.applications ?? []) : [],
    isLoading: enabled && currentResult === null,
    error: enabled ? (currentResult?.error ?? null) : null,
    reload,
  };
};
