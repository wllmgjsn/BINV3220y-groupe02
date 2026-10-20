import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
  {
    id: 7,
    title: "Migration vers le cloud",
    companyShortName: "Orbis",
    academicYear: "2026-2027",
    period: "P1",
    status: "PUBLISHED",
  },
];

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
};

const renderOffersPage = (
  user: typeof adminUser | typeof contactUser | typeof studentUser,
  initialEntry = "/offres",
  onUnauthorized = vi.fn(),
) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <OffersPage user={user} token="jeton" onUnauthorized={onUnauthorized} />
      <LocationProbe />
    </MemoryRouter>,
  );

describe("OffersPage", () => {
  it("affiche les offres avec leurs libellés français", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });

    renderOffersPage(contactUser);

    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/offers",
      expect.objectContaining({ headers: { Authorization: "jeton" } }),
    );
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Autre" })).toBeInTheDocument();
    expect(screen.getByText("3 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
  });

  it("transmet le filtre de période à l'API", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });
    renderOffersPage(adminUser, "/offres?campaign=stage");

    expect(await screen.findByText("Migration vers le cloud")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Période" }), {
      target: { value: "P1" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/offers?period=P1",
        expect.objectContaining({ headers: { Authorization: "jeton" } }),
      );
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/offres?campaign=stage&period=P1",
      );
    });

    fireEvent.change(screen.getByRole("combobox", { name: "Période" }), {
      target: { value: "OTHER" },
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/offers?period=OTHER",
        expect.objectContaining({ headers: { Authorization: "jeton" } }),
      );
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/offres?campaign=stage&period=OTHER",
      );
    });

    fireEvent.change(screen.getByRole("combobox", { name: "Période" }), {
      target: { value: "" },
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/offers",
        expect.objectContaining({ headers: { Authorization: "jeton" } }),
      );
      expect(screen.getByTestId("location")).toHaveTextContent("/offres?campaign=stage");
    });
  });

  it("initialise le filtre depuis l'URL", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });
    renderOffersPage(adminUser, "/offres?period=P2");

    expect(await screen.findByText("Migration vers le cloud")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Période" })).toHaveValue("P2");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/offers?period=P2",
      expect.objectContaining({ headers: { Authorization: "jeton" } }),
    );
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = renderOffersPage(studentUser);
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    renderOffersPage(adminUser);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    renderOffersPage(contactUser);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    renderOffersPage(contactUser, "/offres", onUnauthorized);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
