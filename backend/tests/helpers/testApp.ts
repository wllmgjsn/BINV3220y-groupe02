import type { AuthConfig } from "../../src/config.ts";
import { createApp } from "../../src/app.ts";
import type { Db } from "../../src/db/database.ts";
import type { UserKind } from "../../src/models/user.ts";
import { signToken } from "../../src/utils/token.ts";
import { createTestDatabase } from "./testDatabase.ts";

export const TEST_AUTH_CONFIG: AuthConfig = {
  jwtSecret: "secret-de-test-uniquement-pour-vitest-0123456789",
  demoAuthEnabled: true,
};

/** Application branchée sur une base en mémoire isolée. */
export const createTestApp = (db: Db = createTestDatabase(), config = TEST_AUTH_CONFIG) =>
  createApp(db, config);

/** Jeton valide pour un utilisateur du seed, à placer dans l'en-tête Authorization. */
export const tokenFor = (kind: UserKind, id: number): string =>
  signToken({ kind, id }, TEST_AUTH_CONFIG.jwtSecret);
