import express from "express";
import type { AuthConfig } from "./config.ts";
import { createAuthRouter } from "./controllers/auth.controller.ts";
import { createCompaniesRouter } from "./controllers/companies.controller.ts";
import { healthRouter } from "./controllers/health.controller.ts";
import { createOffersRouter } from "./controllers/offers.controller.ts";
import type { Db } from "./db/database.ts";
import { createAuthenticate } from "./middlewares/authenticate.ts";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.ts";
import { createCompaniesRepository } from "./repositories/companies.repository.ts";
import { createOffersRepository } from "./repositories/offers.repository.ts";
import { createUsersRepository } from "./repositories/users.repository.ts";
import { createAuthService } from "./services/auth.service.ts";
import { createCompaniesService } from "./services/companies.service.ts";
import { createOffersService } from "./services/offers.service.ts";

export const createApp = (db: Db, authConfig: AuthConfig) => {
  const authService = createAuthService(createUsersRepository(db), authConfig.jwtSecret);
  const companiesService = createCompaniesService(createCompaniesRepository(db));
  const offersService = createOffersService(createOffersRepository(db));
  const authenticate = createAuthenticate(authService);

  const app = express();

  app.use(express.json());

  // Routes publiques
  app.use("/health", healthRouter);
  app.use("/auth", createAuthRouter(authService, authenticate, authConfig.demoAuthEnabled));

  // Routes protégées : l'utilisateur est identifié avant d'atteindre le contrôleur.
  app.use("/companies", authenticate, createCompaniesRouter(companiesService));
  app.use("/offers", authenticate, createOffersRouter(offersService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
