import { describe, expect, it } from "vitest";
import {
  isCompany,
  isCompanyList,
  isHealth,
  isOffer,
  isOfferList,
  isSession,
  isUser,
} from "../src/utils/guards.ts";
import { contactUser } from "./helpers/fetchMock.ts";

describe("isHealth", () => {
  it("accepte une réponse valide", () => {
    expect(isHealth({ status: "ok" })).toBe(true);
  });

  it.each([null, "ok", {}, { status: "ko" }])("refuse %j", (value) => {
    expect(isHealth(value)).toBe(false);
  });
});

const company = {
  id: 1,
  name: "Orbis Software SA",
  shortName: "Orbis",
  locality: "Liège",
  status: "ACTIVE",
};

describe("isCompany", () => {
  it("accepte une entreprise valide", () => {
    expect(isCompany(company)).toBe(true);
  });

  it.each([
    ["un statut inconnu", { ...company, status: "Active" }],
    ["un identifiant textuel", { ...company, id: "1" }],
    ["un champ manquant", { ...company, locality: undefined }],
    ["une valeur nulle", null],
  ])("refuse %s", (_case, value) => {
    expect(isCompany(value)).toBe(false);
  });
});

describe("isCompanyList", () => {
  it("accepte une liste vide ou valide", () => {
    expect(isCompanyList([])).toBe(true);
    expect(isCompanyList([company])).toBe(true);
  });

  it("refuse une liste contenant un élément invalide ou un objet", () => {
    expect(isCompanyList([company, { id: 2 }])).toBe(false);
    expect(isCompanyList({ companies: [company] })).toBe(false);
  });
});

describe("isUser", () => {
  it("accepte un utilisateur valide", () => {
    expect(isUser(contactUser)).toBe(true);
  });

  it.each([
    ["un profil inconnu", { ...contactUser, kind: "ROOT" }],
    ["un rôle inconnu", { ...contactUser, roles: ["ADMIN"] }],
    ["une entreprise mal formée", { ...contactUser, companies: [{ id: 2 }] }],
    ["des rôles absents", { ...contactUser, roles: undefined }],
  ])("refuse %s", (_case, value) => {
    expect(isUser(value)).toBe(false);
  });
});

describe("isSession", () => {
  it("exige un jeton et un utilisateur valide", () => {
    expect(isSession({ token: "abc", user: contactUser })).toBe(true);
    expect(isSession({ token: 42, user: contactUser })).toBe(false);
    expect(isSession({ token: "abc" })).toBe(false);
  });
});

const offer = {
  id: 3,
  title: "API REST de facturation",
  companyShortName: "Orbis",
  academicYear: "2026-2027",
  period: "P2",
  status: "PUBLISHED",
};

describe("isOffer", () => {
  it("accepte une offre valide", () => {
    expect(isOffer(offer)).toBe(true);
    expect(isOfferList([offer])).toBe(true);
  });

  it.each([
    ["un statut en français", { ...offer, status: "Publiée" }],
    ["une période inconnue", { ...offer, period: "P3" }],
    ["un titre absent", { ...offer, title: undefined }],
  ])("refuse %s", (_case, value) => {
    expect(isOffer(value)).toBe(false);
  });
});
