import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import NavBar from "../src/components/NavBar.tsx";
import type { User } from "../src/models/user.ts";
import { adminUser, contactUser, promoterUser, studentUser } from "./helpers/fetchMock.ts";

const renderNavBar = (user: User) =>
  render(
    <MemoryRouter>
      <NavBar user={user} />
    </MemoryRouter>,
  );

describe("NavBar", () => {
  it.each([
    ["un administrateur", adminUser],
    ["un étudiant", studentUser],
    ["un déposant", contactUser],
  ])("propose les offres à %s", (_profile, user) => {
    renderNavBar(user);

    expect(screen.getByRole("link", { name: "Offres" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entreprises" })).toBeInTheDocument();
  });

  it("ne propose pas les offres à un contact sans rôle de déposant", () => {
    renderNavBar(promoterUser);

    expect(screen.queryByRole("link", { name: "Offres" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entreprises" })).toBeInTheDocument();
  });
});
