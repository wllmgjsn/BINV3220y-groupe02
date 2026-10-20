import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../src/App.tsx";
import { studentUser, stubFetch } from "./helpers/fetchMock.ts";

const TOKEN_KEY = "gesta.token";

const renderApp = () =>
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
});

describe("App : session", () => {
  it("affiche la connexion de démo sans session", async () => {
    stubFetch({ "/api/auth/demo-users": () => Response.json([studentUser]) });

    renderApp();

    expect(screen.getByRole("heading", { name: "Connexion de démonstration" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Mateusz Kowalski/ })).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("Mode démo");
  });

  it("ouvre une session et la conserve", async () => {
    stubFetch({
      "/api/auth/demo-users": () => Response.json([studentUser]),
      "/api/auth/demo-login": () => Response.json({ token: "jeton-mateusz", user: studentUser }),
      "/api/health": () => Response.json({ status: "ok" }),
    });

    renderApp();
    fireEvent.click(await screen.findByRole("button", { name: /Mateusz Kowalski/ }));

    expect(await screen.findByRole("heading", { name: "Bonjour Mateusz" })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jeton-mateusz");
  });

  it("reprend une session enregistrée confirmée par le backend", async () => {
    localStorage.setItem(TOKEN_KEY, "jeton-mateusz");
    stubFetch({
      "/api/auth/me": () => Response.json(studentUser),
      "/api/health": () => Response.json({ status: "ok" }),
    });

    renderApp();

    expect(await screen.findByRole("heading", { name: "Bonjour Mateusz" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entreprises" })).toBeInTheDocument();
  });

  it("oublie une session refusée par le backend", async () => {
    localStorage.setItem(TOKEN_KEY, "jeton-expire");
    stubFetch({
      "/api/auth/me": () => new Response(null, { status: 401 }),
      "/api/auth/demo-users": () => Response.json([studentUser]),
    });

    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Connexion de démonstration" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("revient à la connexion quand l'utilisateur change de profil", async () => {
    localStorage.setItem(TOKEN_KEY, "jeton-mateusz");
    stubFetch({
      "/api/auth/me": () => Response.json(studentUser),
      "/api/auth/demo-users": () => Response.json([studentUser]),
      "/api/health": () => Response.json({ status: "ok" }),
    });

    renderApp();
    fireEvent.click(await screen.findByRole("button", { name: "Changer d'utilisateur" }));

    expect(screen.getByRole("heading", { name: "Connexion de démonstration" })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
