import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Db } from "./database.ts";

const MIGRATIONS_DIR = fileURLToPath(new URL("./migrations/", import.meta.url));

const listMigrationFiles = (): string[] =>
  readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

/**
 * Applique, dans l'ordre de leur nom, les fichiers SQL de migrations/ qui ne l'ont
 * pas encore été. Retourne les noms des migrations appliquées lors de cet appel.
 */
export const runMigrations = (db: Db): string[] => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    ) STRICT
  `);

  const isApplied = db.prepare("SELECT 1 FROM schema_migrations WHERE name = ?");
  const markApplied = db.prepare("INSERT INTO schema_migrations (name) VALUES (?)");

  const pending = listMigrationFiles().filter((file) => isApplied.get(file) === undefined);

  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    db.transaction(() => {
      db.exec(sql);
      markApplied.run(file);
    })();
  }

  return pending;
};
