import { openDatabase, type Db } from "./database.ts";
import { runMigrations } from "./migrate.ts";
import { SEEDED_TABLES, seedDatabase } from "./seed/seed.ts";

export interface InitializationResult {
  db: Db;
  appliedMigrations: string[];
  seeded: boolean;
}

const isEmpty = (db: Db): boolean =>
  db.prepare("SELECT 1 FROM companies LIMIT 1").get() === undefined;

/** Ouvre la base, applique les migrations en attente et la remplit si elle est vide. */
export const initializeDatabase = (path: string): InitializationResult => {
  const db = openDatabase(path);
  const appliedMigrations = runMigrations(db);
  const seeded = isEmpty(db);
  if (seeded) {
    seedDatabase(db);
  }
  return { db, appliedMigrations, seeded };
};

export const countRows = (db: Db): Record<string, number> =>
  Object.fromEntries(
    SEEDED_TABLES.map((table) => {
      const row = db.prepare<[], { total: number }>(`SELECT COUNT(*) AS total FROM ${table}`).get();
      return [table, row?.total ?? 0];
    }),
  );
