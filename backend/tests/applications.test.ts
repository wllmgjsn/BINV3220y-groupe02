import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { APPLICATION, ADMINISTRATOR, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const applicationsAs = (kind: "ADMIN" | "STUDENT", id: number) =>
  request(app).get("/applications").set("Authorization", tokenFor(kind, id));

describe("/applications", () => {
  it("exige une session", async () => {
    const response = await request(app).get("/applications");

    expect(response.status).toBe(401);
  });

  it("réserve la consultation des candidatures à l'étudiant", async () => {
    const response = await applicationsAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("ne retourne que les candidatures de l'étudiant connecté", async () => {
    const response = await applicationsAs("STUDENT", STUDENT.LUCAS_DUPONT);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: APPLICATION.LUCAS_FLEET_APP,
        offerId: OFFER.FLEET_APP,
        offerTitle: "Application React de gestion de flotte",
        companyShortName: "Lumen Digital",
        message: "Le développement React m'intéresse particulièrement.",
        status: "IN_PROGRESS",
        appliedAt: "2026-10-02 18:10:00",
      },
    ]);
  });

  it("crée une candidature sans message pour une offre publiée", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.INTERNAL_CHATBOT });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.INTERNAL_CHATBOT,
      message: null,
      status: "IN_PROGRESS",
    });
  });

  it("nettoie le message facultatif", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: "  Mon parcours m'intéresse.  " });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Mon parcours m'intéresse.");
  });

  it("refuse un message qui n'est pas un texte", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: 42 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_MESSAGE");
  });

  it("refuse une candidature à une offre non publiée", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.CLIENT_PORTAL });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("OFFER_NOT_PUBLISHED");
  });

  it("refuse une deuxième candidature tant que la précédente n'est pas retirée", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.FLEET_APP });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("ALREADY_APPLIED");
  });

  it("permet de retirer une candidature en cours puis de candidater à nouveau", async () => {
    const response = await request(app)
      .patch(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(204);

    const reapply = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT))
      .send({ offerId: OFFER.FLEET_APP });

    expect(reapply.status).toBe(201);
  });

  it("ne permet pas de retirer la candidature d'un autre étudiant", async () => {
    const response = await request(app)
      .patch(`/applications/${APPLICATION.INES_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("APPLICATION_NOT_FOUND");
  });

  it("interdit de retirer une candidature déjà traitée", async () => {
    const response = await request(app)
      .patch(`/applications/${APPLICATION.MATEUSZ_CLOUD_MIGRATION}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_ALREADY_PROCESSED");
  });
});
