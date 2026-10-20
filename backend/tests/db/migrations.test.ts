import { describe, expect, it } from "vitest";
import { IN_MEMORY, openDatabase } from "../../src/db/database.ts";
import { runMigrations } from "../../src/db/migrate.ts";
import { SEEDED_TABLES } from "../../src/db/seed/seed.ts";

const listTables = (db: ReturnType<typeof openDatabase>): string[] =>
  (
    db
      .prepare("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name")
      .all() as { name: string }[]
  ).map((row) => row.name);

describe("runMigrations", () => {
  it("crée toutes les tables sur une base vierge", () => {
    const db = openDatabase(IN_MEMORY);

    expect(runMigrations(db)).toEqual(["001_initial.sql"]);
    expect(listTables(db)).toEqual([...SEEDED_TABLES, "schema_migrations"].sort());
  });

  it("n'applique pas deux fois la même migration", () => {
    const db = openDatabase(IN_MEMORY);
    runMigrations(db);

    expect(runMigrations(db)).toEqual([]);
  });

  it("active les clés étrangères", () => {
    const db = openDatabase(IN_MEMORY);

    expect(db.pragma("foreign_keys", { simple: true })).toBe(1);
  });
});
