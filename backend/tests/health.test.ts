import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestApp } from "./helpers/testApp.ts";

describe("GET /health", () => {
  it("indique que l'API fonctionne", async () => {
    const response = await request(createTestApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("route inconnue", () => {
  it("retourne une erreur 404 au format JSON commun", async () => {
    const response = await request(createTestApp()).get("/inconnue");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "NOT_FOUND", message: "Route inconnue : GET /inconnue" },
    });
  });
});
