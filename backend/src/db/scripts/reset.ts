// npm run db:reset : supprime la base locale puis la recrée avec les données de démonstration.
import "../../requireSupportedNode.ts";
import { rmSync } from "node:fs";
import { DATABASE_PATH } from "../../config.ts";
import { initializeDatabase } from "../initialize.ts";
import { printSummary } from "./printSummary.ts";

const removeDatabaseFiles = (path: string): void => {
  for (const file of [path, `${path}-wal`, `${path}-shm`, `${path}-journal`]) {
    rmSync(file, { force: true });
  }
};

try {
  removeDatabaseFiles(DATABASE_PATH);
} catch (error: unknown) {
  console.error(
    "Impossible de supprimer la base. Arrêtez le serveur (npm run dev) puis relancez la commande.",
  );
  throw error;
}

const result = initializeDatabase(DATABASE_PATH);
printSummary(DATABASE_PATH, result);
result.db.close();
