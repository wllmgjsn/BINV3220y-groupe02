import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createTestApp } from "./helpers/testApp.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";

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

  describe("erreur interne", () => {
    it("retourne une erreur 500 au format JSON commun sans exposer les détails", async () => {
      const db = createTestDatabase();
      const app = createTestApp(db);
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      db.close();

      try {
        const response = await request(app).get("/auth/demo-users");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: { code: "INTERNAL_ERROR", message: "Erreur interne du serveur" },
        });
        expect(consoleError).toHaveBeenCalledOnce();
      } finally {
        consoleError.mockRestore();
      }
    });
  });
});
