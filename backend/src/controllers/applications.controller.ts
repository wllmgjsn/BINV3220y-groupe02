import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { HttpError } from "../utils/httpError.ts";

const parseId = (value: string, label: string): number => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, "INVALID_ID", `${label} doit être un identifiant valide`);
  }
  return id;
};

const parseMessage = (body: unknown): string | null => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps doit contenir un message facultatif");
  }

  const value = "message" in body ? body.message : undefined;
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_MESSAGE", "Le message doit être un texte");
  }

  const message = value.trim();
  return message === "" ? null : message;
};

export const createApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.get("/", (req, res) => {
    res.json(applicationsService.listApplications(getCurrentUser(req)).map(toApplicationDto));
  });

  router.post("/", (req, res) => {
    const body = req.body as unknown;
    if (typeof body !== "object" || body === null || Array.isArray(body) || !("offerId" in body)) {
      throw new HttpError(400, "INVALID_BODY", "L'identifiant de l'offre est requis");
    }
    const offerId = body.offerId;
    if (typeof offerId !== "number" || !Number.isSafeInteger(offerId) || offerId < 1) {
      throw new HttpError(400, "INVALID_OFFER_ID", "offerId doit être un identifiant valide");
    }

    const application = applicationsService.apply(
      getCurrentUser(req),
      offerId,
      parseMessage(body),
    );
    res.status(201).json(toApplicationDto(application));
  });

  router.patch("/:applicationId/withdraw", (req, res) => {
    applicationsService.withdraw(
      getCurrentUser(req),
      parseId(req.params.applicationId, "applicationId"),
    );
    res.status(204).end();
  });

  return router;
};
