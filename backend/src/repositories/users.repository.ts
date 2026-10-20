import type { Db } from "../db/database.ts";
import type {
  CompanySummaryDbo,
  ContactRoleDbo,
  PersonDbo,
  UserDbo,
  UserKind,
} from "../models/user.ts";

const PERSON_COLUMNS = "id, first_name, last_name, email, status";

export const createUsersRepository = (db: Db) => {
  const findAdministrator = db.prepare<[number], PersonDbo>(
    `SELECT ${PERSON_COLUMNS} FROM administrators WHERE id = ?`,
  );
  const findStudent = db.prepare<[number], PersonDbo>(
    `SELECT ${PERSON_COLUMNS} FROM students WHERE id = ?`,
  );
  const findContact = db.prepare<[number], PersonDbo>(
    `SELECT ${PERSON_COLUMNS} FROM contacts WHERE id = ?`,
  );
  const listAdministrators = db.prepare<[], PersonDbo>(
    `SELECT ${PERSON_COLUMNS} FROM administrators ORDER BY last_name, first_name`,
  );
  const listStudents = db.prepare<[], PersonDbo>(
    `SELECT ${PERSON_COLUMNS} FROM students ORDER BY last_name, first_name`,
  );
  const listContacts = db.prepare<[], PersonDbo>(
    `SELECT ${PERSON_COLUMNS} FROM contacts ORDER BY last_name, first_name`,
  );
  const findRoles = db.prepare<[number], ContactRoleDbo>(
    "SELECT role FROM contact_roles WHERE contact_id = ? ORDER BY role",
  );
  const findCompanies = db.prepare<[number], CompanySummaryDbo>(`
    SELECT c.id, c.short_name
    FROM company_contacts cc JOIN companies c ON c.id = cc.company_id
    WHERE cc.contact_id = ?
    ORDER BY c.short_name COLLATE NOCASE
  `);

  const findByKind = { ADMIN: findAdministrator, STUDENT: findStudent, CONTACT: findContact };
  const listByKind = { ADMIN: listAdministrators, STUDENT: listStudents, CONTACT: listContacts };

  // Seuls les contacts ont des rôles et des entreprises.
  const withContactData = (kind: UserKind, person: PersonDbo): UserDbo =>
    kind === "CONTACT"
      ? { kind, person, roles: findRoles.all(person.id), companies: findCompanies.all(person.id) }
      : { kind, person, roles: [], companies: [] };

  return {
    findById: (kind: UserKind, id: number): UserDbo | undefined => {
      const person = findByKind[kind].get(id);
      return person === undefined ? undefined : withContactData(kind, person);
    },

    listByKind: (kind: UserKind): UserDbo[] =>
      listByKind[kind].all().map((person) => withContactData(kind, person)),
  };
};

export type UsersRepository = ReturnType<typeof createUsersRepository>;
