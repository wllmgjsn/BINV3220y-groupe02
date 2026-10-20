import { IN_MEMORY, openDatabase, type Db } from "../../src/db/database.ts";
import { runMigrations } from "../../src/db/migrate.ts";
import { seedDatabase } from "../../src/db/seed/seed.ts";

/** Base en mémoire, migrée et remplie : isolée de la base de développement. */
export const createTestDatabase = (): Db => {
  const db = openDatabase(IN_MEMORY);
  runMigrations(db);
  seedDatabase(db);
  return db;
};
