import type { Application } from "../models/application.ts";
import { API_URL, ApiError, readJson } from "../utils/api.ts";
import { isApplication, isApplicationList } from "../utils/guards.ts";

export const getApplications = async (
  token: string,
  signal?: AbortSignal,
): Promise<Application[]> => {
  const response = await fetch(`${API_URL}/applications`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isApplicationList, "Chargement des candidatures impossible");
};

export const applyToOffer = async (
  token: string,
  offerId: number,
  message: string,
): Promise<Application> => {
  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ offerId, message }),
  });
  return readJson(response, isApplication, "Envoi de la candidature impossible");
};

export const withdrawApplication = async (token: string, applicationId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/applications/${applicationId}/withdraw`, {
    method: "PATCH",
    headers: { Authorization: token },
  });
  if (!response.ok) {
    throw new ApiError(response.status, `Retrait de la candidature impossible (statut ${response.status})`);
  }
};
