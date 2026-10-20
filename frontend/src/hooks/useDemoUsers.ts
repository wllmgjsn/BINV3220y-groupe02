import { useEffect, useState } from "react";
import type { User } from "../models/user.ts";
import { getDemoUsers } from "../services/auth.service.ts";

export const useDemoUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getDemoUsers(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setUsers(data);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { users, isLoading, error };
};
