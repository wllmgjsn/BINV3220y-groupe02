import type { Db } from "../database.ts";
import { academicYears, periods } from "./academicData.ts";
import { companies, companyContacts, contacts } from "./companiesData.ts";
import { applications, internships, offers } from "./offersData.ts";
import { administrators, students } from "./peopleData.ts";

// Tables remplies par le seed, dans l'ordre des dépendances.
export const SEEDED_TABLES = [
  "academic_years",
  "periods",
  "companies",
  "contacts",
  "contact_roles",
  "company_contacts",
  "students",
  "administrators",
  "offers",
  "applications",
  "internships",
] as const;

const insertRows = (db: Db, table: string, rows: readonly object[]): void => {
  const [first] = rows;
  if (first === undefined) return;

  const columns = Object.keys(first);
  const statement = db.prepare(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map((c) => `@${c}`).join(", ")})`,
  );
  for (const row of rows) {
    statement.run(row);
  }
};

/**
 * Remplace le contenu des tables par les données de démonstration.
 * L'opération est idempotente : l'appeler deux fois produit le même résultat.
 */
export const seedDatabase = (db: Db): void => {
  db.transaction(() => {
    for (const table of [...SEEDED_TABLES].reverse()) {
      db.prepare(`DELETE FROM ${table}`).run();
    }

    insertRows(db, "academic_years", academicYears);
    insertRows(db, "periods", periods);
    insertRows(db, "companies", companies);
    insertRows(
      db,
      "contacts",
      contacts.map(({ roles: _roles, ...contact }) => contact),
    );
    insertRows(
      db,
      "contact_roles",
      contacts.flatMap(({ id, roles }) => roles.map((role) => ({ contact_id: id, role }))),
    );
    insertRows(db, "company_contacts", companyContacts);
    insertRows(db, "students", students);
    insertRows(db, "administrators", administrators);
    insertRows(db, "offers", offers);
    insertRows(db, "applications", applications);
    insertRows(db, "internships", internships);
  })();
};
