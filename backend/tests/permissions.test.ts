import { describe, expect, it } from "vitest";
import type { ContactRole, User, UserKind } from "../src/models/user.ts";
import { canListOffers, hasContactRole, isAdmin } from "../src/services/permissions.ts";

const user = (kind: UserKind, roles: ContactRole[] = []): User => ({
  kind,
  id: 1,
  firstName: "Test",
  lastName: "Utilisateur",
  email: "test@gesta.test",
  roles,
  companies: [],
});

describe("règles d'accès", () => {
  it("reconnaît un administrateur", () => {
    expect(isAdmin(user("ADMIN"))).toBe(true);
    expect(isAdmin(user("CONTACT", ["DEPOSITOR"]))).toBe(false);
  });

  it("n'attribue des rôles de contact qu'aux contacts", () => {
    expect(hasContactRole(user("CONTACT", ["PROMOTER"]), "PROMOTER")).toBe(true);
    expect(hasContactRole(user("CONTACT", ["PROMOTER"]), "DEPOSITOR")).toBe(false);
    expect(hasContactRole(user("STUDENT", ["DEPOSITOR"]), "DEPOSITOR")).toBe(false);
  });

  it.each([
    ["un administrateur", user("ADMIN"), true],
    ["un étudiant", user("STUDENT"), true],
    ["un déposant", user("CONTACT", ["DEPOSITOR"]), true],
    ["un promoteur et signataire", user("CONTACT", ["PROMOTER", "SIGNATORY"]), false],
  ])("autorise la consultation des offres pour %s : %s", (_profile, viewer, expected) => {
    expect(canListOffers(viewer)).toBe(expected);
  });
});
