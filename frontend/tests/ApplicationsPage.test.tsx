import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

describe("ApplicationsPage", () => {
  it("affiche les statuts et permet de retirer une candidature en cours", async () => {
    const fetchMock = stubFetch({
      "/api/applications": () =>
        Response.json([
          {
            id: 18,
            offerId: 7,
            offerTitle: "Migration vers le cloud",
            companyShortName: "Orbis",
            message: null,
            status: "IN_PROGRESS",
            appliedAt: "2026-10-02 18:10:00",
          },
          {
            id: 19,
            offerId: 8,
            offerTitle: "Planning de consultants",
            companyShortName: "Datavia",
            message: "Mon expérience.",
            status: "SELECTED",
            appliedAt: "2026-10-01 10:00:00",
          },
          {
            id: 20,
            offerId: 9,
            offerTitle: "Tests d'intégration",
            companyShortName: "Orbis",
            message: null,
            status: "WITHDRAWN",
            appliedAt: "2026-09-30 09:00:00",
          },
        ]),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Migration vers le cloud")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.queryByText("Tests d'intégration")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Afficher les candidatures retirées" }));
    expect(screen.getByText("Tests d'intégration")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/applications/18/withdraw",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });

  it("permet d'afficher les candidatures retirées quand aucune autre candidature n'existe", async () => {
    stubFetch({
      "/api/applications": () =>
        Response.json([
          {
            id: 20,
            offerId: 9,
            offerTitle: "Tests d'intégration",
            companyShortName: "Orbis",
            message: null,
            status: "WITHDRAWN",
            appliedAt: "2026-09-30 09:00:00",
          },
        ]),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Aucune candidature à afficher.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Afficher les candidatures retirées" }));
    expect(screen.getByText("Tests d'intégration")).toBeInTheDocument();
  });
});
