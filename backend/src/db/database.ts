import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type Db = Database.Database;

export const IN_MEMORY = ":memory:";

export const openDatabase = (path: string): Db => {
  if (path !== IN_MEMORY) {
    mkdirSync(dirname(path), { recursive: true });
  }

  const db = new Database(path);
  // SQLite n'applique les clés étrangères que si elles sont activées à chaque connexion.
  db.pragma("foreign_keys = ON");
  return db;
};
