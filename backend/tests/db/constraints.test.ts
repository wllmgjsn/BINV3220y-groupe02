import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../../src/db/database.ts";
import {
  ACADEMIC_YEAR,
  COMPANY,
  CONTACT,
  OFFER,
  PERIOD,
  STUDENT,
} from "../../src/db/seed/seedIds.ts";
import { createTestDatabase } from "../helpers/testDatabase.ts";

// Les cas invalides sont construits ici, jamais dans le seed.

let db: Db;

beforeEach(() => {
  db = createTestDatabase();
});

const validOffer = {
  company_id: COMPANY.ORBIS,
  depositor_contact_id: CONTACT.MARC_LEJEUNE,
  promoter_contact_id: CONTACT.NADIA_CHERIF,
  academic_year_id: ACADEMIC_YEAR.Y2026_2027,
  period_id: PERIOD.Y2026_2027_P1,
  title: "Offre de test",
  description: "Description",
  status: "SUBMITTED",
};

const insertOffer = (overrides: Partial<Record<keyof typeof validOffer, unknown>> = {}) =>
  db
    .prepare(
      `INSERT INTO offers (company_id, depositor_contact_id, promoter_contact_id,
         academic_year_id, period_id, title, description, status)
       VALUES (@company_id, @depositor_contact_id, @promoter_contact_id,
         @academic_year_id, @period_id, @title, @description, @status)`,
    )
    .run({ ...validOffer, ...overrides });

describe("offres", () => {
  it("accepte une offre valide", () => {
    expect(() => insertOffer()).not.toThrow();
  });

  it("refuse une entreprise inexistante", () => {
    expect(() => insertOffer({ company_id: 999 })).toThrow(/FOREIGN KEY/);
  });

  it("refuse un déposant non rattaché à l'entreprise", () => {
    expect(() => insertOffer({ depositor_contact_id: CONTACT.CLAIRE_DUMONT })).toThrow(
      /FOREIGN KEY/,
    );
  });

  it("refuse un promoteur non rattaché à l'entreprise", () => {
    expect(() => insertOffer({ promoter_contact_id: CONTACT.FATOU_NDIAYE })).toThrow(
      /FOREIGN KEY/,
    );
  });

  it("accepte une offre sans promoteur", () => {
    expect(() => insertOffer({ promoter_contact_id: null })).not.toThrow();
  });

  it("accepte une offre sans déposant, créée par un administrateur", () => {
    expect(() => insertOffer({ depositor_contact_id: null })).not.toThrow();
  });

  it("refuse une période d'une autre année académique", () => {
    expect(() => insertOffer({ period_id: PERIOD.Y2025_2026_P1 })).toThrow(/FOREIGN KEY/);
  });

  it("refuse un statut inconnu", () => {
    expect(() => insertOffer({ status: "Publiée" })).toThrow(/CHECK/);
  });

  it("refuse un titre vide", () => {
    expect(() => insertOffer({ title: "   " })).toThrow(/CHECK/);
  });
});

describe("contacts et rattachements", () => {
  it("refuse un e-mail déjà utilisé, quelle que soit la casse", () => {
    expect(() =>
      db
        .prepare("INSERT INTO contacts (first_name, last_name, email) VALUES (?, ?, ?)")
        .run("Autre", "Personne", "CLAIRE.DUMONT@lumen-digital.test"),
    ).toThrow(/UNIQUE/);
  });

  it("refuse un rattachement en double", () => {
    expect(() =>
      db
        .prepare("INSERT INTO company_contacts (company_id, contact_id) VALUES (?, ?)")
        .run(COMPANY.ORBIS, CONTACT.MARC_LEJEUNE),
    ).toThrow(/UNIQUE|PRIMARY KEY/);
  });

  it("refuse un rôle pour un contact inexistant", () => {
    expect(() =>
      db.prepare("INSERT INTO contact_roles (contact_id, role) VALUES (?, ?)").run(999, "PROMOTER"),
    ).toThrow(/FOREIGN KEY/);
  });

  it("refuse un rôle en double", () => {
    expect(() =>
      db
        .prepare("INSERT INTO contact_roles (contact_id, role) VALUES (?, ?)")
        .run(CONTACT.MARC_LEJEUNE, "DEPOSITOR"),
    ).toThrow(/UNIQUE|PRIMARY KEY/);
  });

  it("refuse un rôle inconnu", () => {
    expect(() =>
      db
        .prepare("INSERT INTO contact_roles (contact_id, role) VALUES (?, ?)")
        .run(CONTACT.MARC_LEJEUNE, "ADMIN"),
    ).toThrow(/CHECK/);
  });
});

describe("statuts", () => {
  it("accepte une entreprise et un contact « À vérifier »", () => {
    expect(() =>
      db
        .prepare("INSERT INTO companies (name, short_name, locality, status) VALUES (?, ?, ?, ?)")
        .run("Nouvelle SRL", "Nouvelle", "Namur", "TO_VERIFY"),
    ).not.toThrow();
    expect(() =>
      db
        .prepare("INSERT INTO contacts (first_name, last_name, email, status) VALUES (?, ?, ?, ?)")
        .run("Nouveau", "Contact", "nouveau.contact@nouvelle.test", "TO_VERIFY"),
    ).not.toThrow();
  });
});

describe("années académiques", () => {
  it("refuse une deuxième année courante", () => {
    expect(() =>
      db
        .prepare(
          "INSERT INTO academic_years (label, start_date, end_date, is_current) VALUES (?, ?, ?, 1)",
        )
        .run("2027-2028", "2027-09-13", "2028-09-10"),
    ).toThrow(/UNIQUE/);
  });
});

const insertInternship = (overrides: Record<string, unknown> = {}) =>
  db
    .prepare(
      `INSERT INTO internships (student_id, company_id, subject, promoter_contact_id,
         start_date, end_date, academic_year_id, period_id)
       VALUES (@student_id, @company_id, @subject, @promoter_contact_id,
         @start_date, @end_date, @academic_year_id, @period_id)`,
    )
    .run({
      student_id: STUDENT.LEA_MERTENS,
      company_id: COMPANY.DATAVIA,
      subject: "Sujet de test",
      promoter_contact_id: CONTACT.FATOU_NDIAYE,
      start_date: "2027-02-08",
      end_date: "2027-05-28",
      academic_year_id: ACADEMIC_YEAR.Y2026_2027,
      period_id: PERIOD.Y2026_2027_P2,
      ...overrides,
    });

describe("candidatures et stages", () => {
  it("accepte un stage valide, avec ou sans promoteur", () => {
    expect(() => insertInternship()).not.toThrow();
    expect(() => insertInternship({ promoter_contact_id: null })).not.toThrow();
  });

  it("refuse un promoteur de stage non rattaché à l'entreprise", () => {
    expect(() => insertInternship({ promoter_contact_id: CONTACT.MARC_LEJEUNE })).toThrow(
      /FOREIGN KEY/,
    );
  });

  it("refuse un stage sans sujet", () => {
    expect(() => insertInternship({ subject: " " })).toThrow(/CHECK/);
  });

  it("refuse un deuxième stage pour la même offre", () => {
    const insertWithOffer = () =>
      db
        .prepare(
          `INSERT INTO internships (student_id, company_id, offer_id, subject,
             start_date, end_date, academic_year_id, period_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          STUDENT.LEA_MERTENS,
          COMPANY.DATAVIA,
          OFFER.CLOUD_MIGRATION,
          "Sujet de test",
          "2027-02-08",
          "2027-05-28",
          ACADEMIC_YEAR.Y2026_2027,
          PERIOD.Y2026_2027_P2,
        );

    expect(insertWithOffer).toThrow(/UNIQUE/);
  });

  it("refuse un stage dont la date de fin précède le début", () => {
    expect(() => insertInternship({ start_date: "2027-05-28", end_date: "2027-02-08" })).toThrow(
      /CHECK/,
    );
  });
});
