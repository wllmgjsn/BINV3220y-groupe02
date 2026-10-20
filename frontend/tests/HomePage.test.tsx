import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "../src/pages/HomePage.tsx";
import { contactUser, stubFetch } from "./helpers/fetchMock.ts";

describe("HomePage", () => {
  it("accueille l'utilisateur et rappelle son profil et ses entreprises", async () => {
    stubFetch({ "/api/health": () => Response.json({ status: "ok" }) });

    render(<HomePage user={contactUser} />);

    expect(screen.getByRole("heading", { name: "Bonjour Julien" })).toBeInTheDocument();
    expect(screen.getByText(/contact d'entreprise · déposant, promoteur/)).toBeInTheDocument();
    expect(screen.getByText("Entreprises : Lumen Data, Lumen Digital")).toBeInTheDocument();
    expect(await screen.findByText("Gesta — API connectée")).toBeInTheDocument();
  });

  it("affiche une erreur si l'API répond en erreur", async () => {
    stubFetch({ "/api/health": () => new Response(null, { status: 502 }) });

    render(<HomePage user={contactUser} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 502");
  });
});
