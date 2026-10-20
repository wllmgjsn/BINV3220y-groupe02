import type { Health } from "../models/health.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isHealth } from "../utils/guards.ts";

export const getHealth = async (): Promise<Health> => {
  const response = await fetch(`${API_URL}/health`);
  return readJson(response, isHealth, "API indisponible");
};
