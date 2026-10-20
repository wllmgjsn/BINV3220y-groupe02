import type { Company } from "../models/company.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isCompanyList } from "../utils/guards.ts";

export const getCompanies = async (
  token: string,
  search: string,
  signal?: AbortSignal,
): Promise<Company[]> => {
  const params = new URLSearchParams();
  if (search.trim() !== "") {
    params.set("q", search.trim());
  }
  const query = params.size > 0 ? `?${params.toString()}` : "";

  const response = await fetch(`${API_URL}/companies${query}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isCompanyList, "Chargement des entreprises impossible");
};
