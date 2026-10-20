import { existsSync } from "node:fs";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? "3000");
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error(`API_PORT invalide : ${value}`);
  }
  return port;
};

// API_PORT plutôt que PORT : une variable PORT générique, définie par un autre
// outil, ne doit pas déplacer l'API hors du port attendu par le proxy Vite.
export const API_PORT = parsePort(process.env.API_PORT);

// Chemin relatif au dossier backend/. La base locale n'est pas versionnée.
export const DATABASE_PATH = process.env.DATABASE_PATH ?? "data/gesta.db";

export interface AuthConfig {
  jwtSecret: string;
  demoAuthEnabled: boolean;
}

/**
 * Le mode démo permet de se connecter sans mot de passe sous n'importe quelle identité.
 * Il ne doit jamais être actif en production.
 */
export const assertDemoAuthAllowed = (nodeEnv: string | undefined, demoAuthEnabled: boolean) => {
  if (demoAuthEnabled && nodeEnv === "production") {
    throw new Error(
      "DEMO_AUTH_ENABLED=true est interdit quand NODE_ENV=production : le mode démo n'est pas une authentification.",
    );
  }
};

// Lue seulement au démarrage du serveur : les scripts de base de données n'en ont pas besoin.
export const loadAuthConfig = (): AuthConfig => {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET absent ou trop court : lancez npm run setup à la racine du projet.");
  }

  const demoAuthEnabled = process.env.DEMO_AUTH_ENABLED === "true";
  assertDemoAuthAllowed(process.env.NODE_ENV, demoAuthEnabled);

  return { jwtSecret, demoAuthEnabled };
};
