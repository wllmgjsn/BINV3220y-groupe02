import { useEffect, useState } from "react";
import type { Health } from "../models/health.ts";
import { getHealth } from "../services/health.service.ts";

export const useHealth = () => {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getHealth()
      .then((data) => {
        if (isActive) setHealth(data);
      })
      .catch((reason: unknown) => {
        if (isActive) {
          setError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { health, error, isLoading: health === null && error === null };
};
