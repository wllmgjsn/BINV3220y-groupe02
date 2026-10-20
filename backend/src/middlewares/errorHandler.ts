import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../utils/httpError.ts";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, "NOT_FOUND", `Route inconnue : ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Erreur interne du serveur" },
  });
};
