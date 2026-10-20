import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { assertDemoAuthAllowed } from "../src/config.ts";
import type { Db } from "../src/db/database.ts";
import { ADMINISTRATOR, CONTACT, STUDENT } from "../src/db/seed/seedIds.ts";
import { TEST_AUTH_CONFIG, createTestApp, tokenFor } from "./helpers/testApp.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";

let db: Db;
let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  db = createTestDatabase();
  app = createTestApp(db);
});

const me = (token?: string) => {
  const req = request(app).get("/auth/me");
  return token === undefined ? req : req.set("Authorization", token);
};

describe("GET /auth/demo-users", () => {
  it("propose uniquement les comptes actifs et les contacts qui ont un rôle", async () => {
    const response = await request(app).get("/auth/demo-users");
    const ids = (kind: string) =>
      response.body.filter((u: { kind: string }) => u.kind === kind).map((u: { id: number }) => u.id);

    expect(response.status).toBe(200);
    expect(ids("ADMIN")).toHaveLength(2);
    expect(ids("STUDENT")).toHaveLength(9);
    expect(ids("CONTACT")).toHaveLength(17);
    expect(ids("CONTACT")).not.toContain(CONTACT.HELENE_VERMEULEN);
    expect(ids("CONTACT")).not.toContain(CONTACT.BERNARD_PETIT);
    expect(ids("CONTACT")).not.toContain(CONTACT.YANN_DELCOURT);
  });
});

describe("POST /auth/demo-login", () => {
  it("retourne un jeton et l'utilisateur relu en base", async () => {
    const response = await request(app)
      .post("/auth/demo-login")
      .send({ kind: "CONTACT", id: CONTACT.JULIEN_LAMBERT });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe("string");
    expect(response.body.user).toMatchObject({
      kind: "CONTACT",
      id: CONTACT.JULIEN_LAMBERT,
      firstName: "Julien",
      roles: ["DEPOSITOR", "PROMOTER", "SIGNATORY"],
      companies: [
        { id: 3, shortName: "Lumen Data" },
        { id: 2, shortName: "Lumen Digital" },
      ],
    });
  });

  it("ne place que l'identité dans le jeton, jamais les droits", async () => {
    const response = await request(app)
      .post("/auth/demo-login")
      .send({ kind: "CONTACT", id: CONTACT.JULIEN_LAMBERT });
    const payload = jwt.decode(response.body.token) as Record<string, unknown>;

    expect(Object.keys(payload).sort()).toEqual(["exp", "iat", "id", "kind"]);
  });

  it.each([
    ["un corps vide", undefined],
    ["un profil inconnu", { kind: "ROOT", id: 1 }],
    ["un identifiant textuel", { kind: "STUDENT", id: "1" }],
  ])("refuse %s (400)", async (_case, body) => {
    const response = await request(app).post("/auth/demo-login").send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });

  it.each([
    ["un contact sans rôle", CONTACT.HELENE_VERMEULEN],
    ["un contact désactivé", CONTACT.BERNARD_PETIT],
    ["un contact à vérifier", CONTACT.YANN_DELCOURT],
    ["un contact inexistant", 999],
  ])("refuse %s (401)", async (_case, id) => {
    const response = await request(app).post("/auth/demo-login").send({ kind: "CONTACT", id });

    expect(response.status).toBe(401);
  });
});

describe("GET /auth/me", () => {
  it("retrouve l'utilisateur identifié par le jeton", async () => {
    const response = await me(tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      kind: "STUDENT",
      id: STUDENT.MATEUSZ_KOWALSKI,
      firstName: "Mateusz",
      lastName: "Kowalski",
      email: "mateusz.kowalski@etu.gesta.test",
      roles: [],
      companies: [],
    });
  });

  it("refuse une requête sans jeton", async () => {
    expect((await me()).status).toBe(401);
  });

  it.each([
    ["mal formé", "pas-un-jeton"],
    [
      "signé avec une autre clé",
      jwt.sign({ kind: "ADMIN", id: 1 }, "une-autre-cle-de-signature-de-32-caracteres"),
    ],
    [
      "expiré",
      jwt.sign({ kind: "ADMIN", id: 1, exp: Math.floor(Date.now() / 1000) - 60 }, TEST_AUTH_CONFIG.jwtSecret),
    ],
    ["sans signature", jwt.sign({ kind: "ADMIN", id: 1 }, "", { algorithm: "none" })],
  ])("refuse un jeton %s", async (_case, token) => {
    expect((await me(token)).status).toBe(401);
  });

  it("refuse un jeton modifié pour usurper un administrateur", async () => {
    const [header, , signature] = tokenFor("STUDENT", STUDENT.LUCAS_DUPONT).split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ kind: "ADMIN", id: 1 })).toString("base64url");

    expect((await me(`${header}.${forgedPayload}.${signature}`)).status).toBe(401);
  });

  it("refuse le jeton d'un compte désactivé depuis la connexion", async () => {
    const token = tokenFor("STUDENT", STUDENT.LUCAS_DUPONT);
    db.prepare("UPDATE students SET status = 'INACTIVE' WHERE id = ?").run(STUDENT.LUCAS_DUPONT);

    expect((await me(token)).status).toBe(401);
  });

  it("relit les rôles en base à chaque requête", async () => {
    const token = tokenFor("CONTACT", CONTACT.NADIA_CHERIF);
    db.prepare("DELETE FROM contact_roles WHERE contact_id = ? AND role = 'SIGNATORY'").run(
      CONTACT.NADIA_CHERIF,
    );

    expect((await me(token)).body.roles).toEqual(["PROMOTER"]);

    db.prepare("DELETE FROM contact_roles WHERE contact_id = ?").run(CONTACT.NADIA_CHERIF);

    expect((await me(token)).status).toBe(401);
  });
});

describe("rôles déclarés par le client", () => {
  it("ignore un rôle envoyé dans un en-tête, la requête ou le corps", async () => {
    const response = await request(app)
      .get("/companies")
      .query({ role: "ADMIN", kind: "ADMIN" })
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT))
      .set("X-Role", "ADMIN")
      .send({ kind: "ADMIN", roles: ["DEPOSITOR"] });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(11);
  });
});

describe("garde du mode démo", () => {
  it("n'expose pas les routes de démo quand le mode est désactivé", async () => {
    const appWithoutDemo = createTestApp(db, { ...TEST_AUTH_CONFIG, demoAuthEnabled: false });

    expect((await request(appWithoutDemo).get("/auth/demo-users")).status).toBe(404);
    expect(
      (await request(appWithoutDemo).post("/auth/demo-login").send({ kind: "ADMIN", id: 1 })).status,
    ).toBe(404);
    expect(
      (
        await request(appWithoutDemo)
          .get("/auth/me")
          .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ))
      ).status,
    ).toBe(200);
  });

  it("interdit le mode démo en production", () => {
    expect(() => assertDemoAuthAllowed("production", true)).toThrow(/interdit/);
    expect(() => assertDemoAuthAllowed("production", false)).not.toThrow();
    expect(() => assertDemoAuthAllowed("development", true)).not.toThrow();
    expect(() => assertDemoAuthAllowed(undefined, true)).not.toThrow();
  });
});
