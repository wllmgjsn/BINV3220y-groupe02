import { Router, type RequestHandler } from "express";
import { toUserDto } from "../mappers/user.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { USER_KINDS, type UserKind } from "../models/user.ts";
import type { AuthService } from "../services/auth.service.ts";
import { HttpError } from "../utils/httpError.ts";

interface DemoLoginBody {
  kind: UserKind;
  id: number;
}

const isDemoLoginBody = (value: unknown): value is DemoLoginBody => {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  return (
    (USER_KINDS as readonly unknown[]).includes(body.kind) &&
    typeof body.id === "number" &&
    Number.isInteger(body.id) &&
    body.id > 0
  );
};

export const createAuthRouter = (
  authService: AuthService,
  authenticate: RequestHandler,
  demoAuthEnabled: boolean,
) => {
  const router = Router();

  // Routes du mode démo : absentes quand DEMO_AUTH_ENABLED n'est pas activé.
  if (demoAuthEnabled) {
    router.get("/demo-users", (_req, res) => {
      res.json(authService.listDemoUsers().map(toUserDto));
    });

    router.post("/demo-login", (req, res) => {
      const body: unknown = req.body;
      if (!isDemoLoginBody(body)) {
        throw new HttpError(
          400,
          "INVALID_BODY",
          "Le corps doit contenir kind (ADMIN, STUDENT ou CONTACT) et un id entier positif",
        );
      }
      const { token, user } = authService.demoSignIn(body.kind, body.id);
      res.json({ token, user: toUserDto(user) });
    });
  }

  router.get("/me", authenticate, (req, res) => {
    res.json(toUserDto(getCurrentUser(req)));
  });

  return router;
};
