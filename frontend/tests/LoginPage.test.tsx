import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "../src/pages/LoginPage.tsx";
import { contactUser, studentUser, stubFetch } from "./helpers/fetchMock.ts";

describe("LoginPage", () => {
  it("regroupe les utilisateurs de démo par profil", async () => {
    stubFetch({ "/api/auth/demo-users": () => Response.json([studentUser, contactUser]) });

    render(<LoginPage onLogin={vi.fn()} />);

    expect(await screen.findByRole("button", { name: /Mateusz Kowalski/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Étudiants" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Julien Lambert.*Lumen Data, Lumen Digital · déposant/ }),
    ).toBeInTheDocument();
  });

  it("se connecte avec l'utilisateur choisi", async () => {
    stubFetch({ "/api/auth/demo-users": () => Response.json([studentUser, contactUser]) });
    const onLogin = vi.fn(() => Promise.resolve());

    render(<LoginPage onLogin={onLogin} />);
    fireEvent.click(await screen.findByRole("button", { name: /Julien Lambert/ }));

    expect(onLogin).toHaveBeenCalledWith("CONTACT", 4);
  });

  it("affiche l'échec de la connexion", async () => {
    stubFetch({ "/api/auth/demo-users": () => Response.json([studentUser]) });
    const onLogin = vi.fn(() => Promise.reject(new Error("Connexion impossible (statut 401)")));

    render(<LoginPage onLogin={onLogin} />);
    fireEvent.click(await screen.findByRole("button", { name: /Mateusz Kowalski/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 401");
  });
});
