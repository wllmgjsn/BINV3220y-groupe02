import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, COMPANY, CONTACT, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const adminToken = () => tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);
const studentToken = () => tokenFor("STUDENT", STUDENT.LUCAS_DUPONT);

const shortNames = (body: { shortName: string }[]): string[] => body.map((c) => c.shortName);

describe("GET /companies : accès", () => {
  it("refuse une requête sans session", async () => {
    const response = await request(app).get("/companies");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("montre toutes les entreprises à un administrateur", async () => {
    const response = await request(app).get("/companies").set("Authorization", adminToken());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(13);
    expect(response.body[0]).toEqual({
      id: COMPANY.ARCHIVIUM,
      name: "Archivium SA",
      shortName: "Archivium",
      locality: "Tournai",
      status: "ARCHIVED",
    });
  });

  it.each([
    ["un étudiant", studentToken],
    ["un contact", () => tokenFor("CONTACT", CONTACT.JULIEN_LAMBERT)],
  ])("ne montre que les entreprises actives à %s", async (_profile, token) => {
    const response = await request(app).get("/companies").set("Authorization", token());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(11);
    expect(response.body.every((c: { status: string }) => c.status === "ACTIVE")).toBe(true);
  });
});

describe("GET /companies : recherche", () => {
  const search = (q: string, token = adminToken()) =>
    request(app).get("/companies").query({ q }).set("Authorization", token);

  it("n'expose que les champs du DTO", async () => {
    const response = await request(app).get("/companies").set("Authorization", adminToken());

    expect(Object.keys(response.body[0]).sort()).toEqual(
      ["id", "locality", "name", "shortName", "status"],
    );
  });

  it("cherche dans le nom complet et le nom abrégé, sans tenir compte de la casse", async () => {
    const response = await search("LUMEN");

    expect(response.status).toBe(200);
    expect(shortNames(response.body)).toEqual(["Lumen", "Lumen Data", "Lumen Digital"]);
  });

  it("trouve une entreprise par une partie de son nom complet", async () => {
    expect(shortNames((await search("conseil")).body)).toEqual(["Hexagone"]);
  });

  it("combine la recherche et la visibilité selon le profil", async () => {
    expect(shortNames((await search("archiv")).body)).toEqual(["Archivium"]);
    expect((await search("archiv", studentToken())).body).toEqual([]);
  });

  it("traite les caractères spéciaux de LIKE comme du texte", async () => {
    const response = await search("%");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("ignore une recherche vide", async () => {
    expect((await search("   ")).body).toHaveLength(13);
  });

  it("refuse une recherche trop longue", async () => {
    const response = await search("a".repeat(101));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
  });

  it("refuse un paramètre q répété", async () => {
    const response = await request(app)
      .get("/companies?q=a&q=b")
      .set("Authorization", adminToken());

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
  });
});
