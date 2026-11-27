import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, CONTACT, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import type { Db } from "../src/db/database.ts";
import type { UserKind } from "../src/models/user.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";

let app: ReturnType<typeof createTestApp>;
let db: Db;

beforeEach(() => {
  db = createTestDatabase();
  app = createTestApp(db);
});

afterEach(() => db.close());

const listOffersAs = (kind: UserKind, id: number) =>
  request(app).get("/offers").set("Authorization", tokenFor(kind, id));

const listOffersWithPeriodAs = (kind: UserKind, id: number, period: string) =>
  request(app).get(`/offers?period=${period}`).set("Authorization", tokenFor(kind, id));

const listOffersWithSearchAs = (kind: UserKind, id: number, search: string) =>
  request(app).get("/offers").query({ q: search }).set("Authorization", tokenFor(kind, id));

const offerIds = (body: { id: number }[]): number[] => body.map((offer) => offer.id);

describe("GET /offers : accès", () => {
  it("refuse une requête sans session (401)", async () => {
    const response = await request(app).get("/offers");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });

  it.each([
    ["promoteur et signataire", CONTACT.NADIA_CHERIF],
    ["signataire uniquement", CONTACT.NATHALIE_RENARD],
    ["promoteur uniquement", CONTACT.LAURA_SIMON],
  ])("refuse un contact %s (403)", async (_profile, id) => {
    const response = await listOffersAs("CONTACT", id);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
    expect(response.body.error.message).toBe("Vous n'avez pas accès à cette ressource");
  });
});

describe("GET /offers : visibilité selon le profil", () => {
  it("montre toutes les offres à un administrateur, de la plus récente année à la plus ancienne", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(11);
    expect(response.body.at(-1)).toEqual({
      id: OFFER.PDF_REPORTS,
      title: "Module de rapports PDF",
      companyShortName: "Orbis",
      academicYear: "2025-2026",
      period: "P1",
      status: "ARCHIVED",
    });
  });

  describe("DELETE /offers/:offerId", () => {
    const removeOfferAs = (kind: UserKind, id: number, offerId: number) =>
      request(app).delete(`/offers/${offerId}`).set("Authorization", tokenFor(kind, id));

    it("permet à un administrateur de supprimer une offre sans stage et ses candidatures", async () => {
      const response = await removeOfferAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ, OFFER.BILLING_API);

      expect(response.status).toBe(204);
      expect(db.prepare("SELECT id FROM offers WHERE id = ?").get(OFFER.BILLING_API)).toBeUndefined();
      expect(
        db.prepare("SELECT id FROM applications WHERE offer_id = ?").all(OFFER.BILLING_API),
      ).toEqual([]);
    });

    it("permet au déposant de retirer sa propre offre non publiée", async () => {
      const response = await removeOfferAs("CONTACT", CONTACT.MARC_LEJEUNE, OFFER.E2E_TESTS);

      expect(response.status).toBe(204);
      expect(db.prepare("SELECT id FROM offers WHERE id = ?").get(OFFER.E2E_TESTS)).toBeUndefined();
    });

    it("refuse au déposant de retirer son offre soumise liée à un stage", async () => {
      const response = await removeOfferAs(
        "CONTACT",
        CONTACT.JULIEN_LAMBERT,
        OFFER.E2E_BLOCKED_REMOVAL,
      );

      expect(response.status).toBe(409);
      expect(response.body.error).toEqual({
        code: "OFFER_HAS_INTERNSHIP",
        message: "Cette offre est liée à un stage et ne peut pas être supprimée",
      });
      expect(
        db.prepare("SELECT id FROM offers WHERE id = ?").get(OFFER.E2E_BLOCKED_REMOVAL),
      ).toBeDefined();
    });

    it("refuse à un déposant de retirer une offre d'un autre contact", async () => {
      const response = await removeOfferAs("CONTACT", CONTACT.CLAIRE_DUMONT, OFFER.CLIENT_PORTAL);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    });

    it("refuse au déposant de retirer une offre publiée", async () => {
      const response = await removeOfferAs("CONTACT", CONTACT.MARC_LEJEUNE, OFFER.BILLING_API);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("OFFER_NOT_REMOVABLE");
    });

    it("empêche même un administrateur de supprimer une offre liée à un stage", async () => {
      const response = await removeOfferAs(
        "ADMIN",
        ADMINISTRATOR.ANNE_LECLERCQ,
        OFFER.CLOUD_MIGRATION,
      );

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("OFFER_HAS_INTERNSHIP");
      expect(
        db.prepare("SELECT id FROM offers WHERE id = ?").get(OFFER.CLOUD_MIGRATION),
      ).toBeDefined();
    });
  });

  it.each(["P1", "P2", "OTHER"])(
    "filtre les offres d'un administrateur par période %s",
    async (period) => {
      const response = await listOffersWithPeriodAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ, period);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every((offer: { period: string }) => offer.period === period)).toBe(
        true,
      );
    },
  );

  it("combine le filtre de période avec la visibilité des étudiants", async () => {
    const response = await listOffersWithPeriodAs("STUDENT", STUDENT.LUCAS_DUPONT, "P1");

    expect(response.status).toBe(200);
    expect(
      response.body.every(
        (offer: { period: string; status: string }) =>
          offer.period === "P1" && offer.status === "PUBLISHED",
      ),
    ).toBe(true);
  });

  it("rejette une période inconnue", async () => {
    const response = await listOffersWithPeriodAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ, "P3");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
  });

  it("rejette un paramètre period répété", async () => {
    const response = await request(app)
      .get("/offers?period=P1&period=P2")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual({
      code: "INVALID_QUERY",
      message: "Le paramètre period doit être P1, P2 ou OTHER",
    });
  });

  it("ne montre que les offres publiées à un étudiant", async () => {
    const response = await listOffersAs("STUDENT", STUDENT.LUCAS_DUPONT);

    expect(offerIds(response.body)).toEqual([
      OFFER.INTERNAL_CHATBOT,
      OFFER.DATA_QUALITY,
      OFFER.FLEET_APP,
      OFFER.BILLING_API,
    ]);
    expect(response.body.every((o: { status: string }) => o.status === "PUBLISHED")).toBe(true);
  });

  it("recherche une expression entière dans le titre sans distinguer la casse", async () => {
    const response = await listOffersWithSearchAs(
      "ADMIN",
      ADMINISTRATOR.ANNE_LECLERCQ,
      "  RAPPORTS pdf  ",
    );

    expect(response.status).toBe(200);
    expect(offerIds(response.body)).toEqual([OFFER.PDF_REPORTS]);
  });

  it("combine la recherche avec la période et conserve la visibilité étudiante", async () => {
    const response = await request(app)
      .get("/offers")
      .query({ q: "api", period: "P2" })
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: OFFER.BILLING_API,
        period: "P2",
        status: "PUBLISHED",
      }),
    ]);
  });

  it("ignore une recherche vide et renvoie une liste vide sans correspondance", async () => {
    const emptySearch = await listOffersWithSearchAs(
      "ADMIN",
      ADMINISTRATOR.ANNE_LECLERCQ,
      "   ",
    );
    const noMatch = await listOffersWithSearchAs(
      "ADMIN",
      ADMINISTRATOR.ANNE_LECLERCQ,
      "titre inexistant",
    );

    expect(emptySearch.status).toBe(200);
    expect(emptySearch.body).toHaveLength(11);
    expect(noMatch.status).toBe(200);
    expect(noMatch.body).toEqual([]);
  });

  it("montre à un déposant toutes ses offres, quel que soit leur statut", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.MARC_LEJEUNE);

    expect(offerIds(response.body)).toEqual([
      OFFER.E2E_TESTS,
      OFFER.BILLING_API,
      OFFER.PDF_REPORTS,
    ]);
  });

  it("ne montre pas à un déposant l'offre d'un collègue de la même entreprise", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.CLAIRE_DUMONT);

    expect(offerIds(response.body)).toEqual([OFFER.FLEET_APP]);
    expect(offerIds(response.body)).not.toContain(OFFER.CLIENT_PORTAL);
  });

  it("montre à un contact multi-entreprises ses offres dans ses deux entreprises", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.JULIEN_LAMBERT);

    expect(response.body.map((o: { companyShortName: string }) => o.companyShortName)).toEqual([
      "Lumen Digital",
      "Lumen Digital",
      "Lumen Data",
    ]);
    expect(offerIds(response.body)).toEqual([
      OFFER.E2E_BLOCKED_REMOVAL,
      OFFER.CLIENT_PORTAL,
      OFFER.DATA_QUALITY,
    ]);
  });

  it("n'expose que les champs du DTO", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(Object.keys(response.body[0]).sort()).toEqual(
      ["academicYear", "companyShortName", "id", "period", "status", "title"],
    );
  });
});
