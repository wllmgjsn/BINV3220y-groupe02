import { countRows, type InitializationResult } from "../initialize.ts";

export const printSummary = (path: string, result: InitializationResult): void => {
  const { db, appliedMigrations, seeded } = result;

  console.log(`Base : ${path}`);
  console.log(
    appliedMigrations.length > 0
      ? `Migrations appliquées : ${appliedMigrations.join(", ")}`
      : "Aucune migration en attente",
  );
  console.log(seeded ? "Données de démonstration insérées" : "Base déjà remplie : données conservées");
  console.table(countRows(db));
};
