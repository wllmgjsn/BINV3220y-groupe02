import "./requireSupportedNode.ts";
import { createApp } from "./app.ts";
import { API_PORT, DATABASE_PATH, loadAuthConfig } from "./config.ts";
import { initializeDatabase } from "./db/initialize.ts";

// Une configuration invalide arrête le serveur avec un message lisible, sans trace de pile.
const loadAuthConfigOrExit = () => {
  try {
    return loadAuthConfig();
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

const authConfig = loadAuthConfigOrExit();

const { db, appliedMigrations, seeded } = initializeDatabase(DATABASE_PATH);
if (appliedMigrations.length > 0) {
  console.log(`Migrations appliquées : ${appliedMigrations.join(", ")}`);
}
if (seeded) {
  console.log("Base vide : données de démonstration insérées");
}

createApp(db, authConfig).listen(API_PORT, () => {
  console.log(`API Gesta démarrée sur http://localhost:${API_PORT}`);
  if (authConfig.demoAuthEnabled) {
    console.log("Mode démo actif : connexion sans mot de passe, réservée au développement local");
  }
});
