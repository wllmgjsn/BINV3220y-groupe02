import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CompaniesPage from "../src/pages/CompaniesPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const companies = [
  { id: 4, name: "Orbis Software SA", shortName: "Orbis", locality: "Liège", status: "ACTIVE" },
  { id: 12, name: "Archivium SA", shortName: "Archivium", locality: "Tournai", status: "ARCHIVED" },
];

const renderPage = (onUnauthorized = vi.fn()) =>
  render(<CompaniesPage token="jeton-de-test" onUnauthorized={onUnauthorized} />);

describe("CompaniesPage", () => {
  it("affiche les entreprises et leur nombre", async () => {
    stubFetch({ "/api/companies": () => Response.json(companies) });

    renderPage();

    expect(await screen.findByText("Orbis Software SA")).toBeInTheDocument();
    expect(screen.getByText("Archivée")).toBeInTheDocument();
    expect(screen.getByText("2 entreprises")).toBeInTheDocument();
  });

  it("transmet le jeton de session", async () => {
    const fetchMock = stubFetch({ "/api/companies": () => Response.json(companies) });

    renderPage();
    await screen.findByText("Orbis Software SA");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/companies",
      expect.objectContaining({ headers: { Authorization: "jeton-de-test" } }),
    );
  });

  it("affiche un état vide", async () => {
    stubFetch({ "/api/companies": () => Response.json([]) });

    renderPage();

    expect(
      await screen.findByText("Aucune entreprise ne correspond à la recherche."),
    ).toBeInTheDocument();
  });

  it("affiche une erreur si l'API répond en erreur", async () => {
    stubFetch({ "/api/companies": () => new Response(null, { status: 500 }) });

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 500");
  });

  it("signale une session expirée au lieu d'afficher une erreur", async () => {
    stubFetch({ "/api/companies": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    renderPage(onUnauthorized);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("transmet la recherche saisie à l'API", async () => {
    const fetchMock = stubFetch({ "/api/companies": () => Response.json(companies) });
    renderPage();
    await screen.findByText("Orbis Software SA");

    fireEvent.change(screen.getByLabelText("Rechercher par nom"), { target: { value: "orbis" } });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith("/api/companies?q=orbis", expect.anything()),
    );
  });
});
