import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../../src/db/database.ts";
import { countRows } from "../../src/db/initialize.ts";
import { seedDatabase } from "../../src/db/seed/seed.ts";
import { CONTACT, INTERNSHIP, OFFER } from "../../src/db/seed/seedIds.ts";
import { createTestDatabase } from "../helpers/testDatabase.ts";

let db: Db;

beforeEach(() => {
  db = createTestDatabase();
});

const all = <T>(sql: string, ...params: unknown[]): T[] => db.prepare(sql).all(...params) as T[];

const distinctValues = (sql: string): string[] =>
  all<{ value: string }>(sql).map((row) => row.value).sort();

describe("volumes du seed", () => {
  it("respecte les volumes du cahier des charges", () => {
    const counts = countRows(db);

    expect(counts.companies).toBeGreaterThanOrEqual(10);
    expect(counts.contacts).toBeGreaterThanOrEqual(15);
    expect(counts.students).toBeGreaterThanOrEqual(8);
    expect(counts.administrators).toBe(2);
    expect(counts.academic_years).toBe(2);
    expect(counts.periods).toBe(6);
    expect(counts.offers).toBeGreaterThanOrEqual(8);
    expect(counts.applications).toBeGreaterThanOrEqual(4);
    expect(counts.internships).toBeGreaterThanOrEqual(2);
  });

  it("est idempotent", () => {
    const before = countRows(db);
    seedDatabase(db);

    expect(countRows(db)).toEqual(before);
  });

  it("respecte toutes les clés étrangères", () => {
    expect(db.pragma("foreign_key_check")).toEqual([]);
  });
});

describe("cas couverts par le seed", () => {
  it("contient une seule année courante", () => {
    expect(all("SELECT id FROM academic_years WHERE is_current = 1")).toHaveLength(1);
  });

  it("contient une entreprise mère avec des filiales et une entreprise archivée", () => {
    expect(
      all("SELECT id FROM companies WHERE parent_company_id IS NOT NULL").length,
    ).toBeGreaterThanOrEqual(2);
    expect(all("SELECT id FROM companies WHERE status = 'ARCHIVED'").length).toBeGreaterThanOrEqual(1);
  });

  it("contient un contact rattaché à deux entreprises et cumulant les trois rôles", () => {
    const companies = all(
      "SELECT company_id FROM company_contacts WHERE contact_id = ?",
      CONTACT.JULIEN_LAMBERT,
    );
    const roles = distinctValues(
      `SELECT role AS value FROM contact_roles WHERE contact_id = ${CONTACT.JULIEN_LAMBERT}`,
    );

    expect(companies).toHaveLength(2);
    expect(roles).toEqual(["DEPOSITOR", "PROMOTER", "SIGNATORY"]);
  });

  it("contient un contact sans rôle", () => {
    expect(
      all("SELECT id FROM contacts c WHERE NOT EXISTS (SELECT 1 FROM contact_roles r WHERE r.contact_id = c.id)"),
    ).toEqual([{ id: CONTACT.HELENE_VERMEULEN }]);
  });

  it("contient une entreprise et un contact « À vérifier »", () => {
    expect(all("SELECT id FROM companies WHERE status = 'TO_VERIFY'")).toHaveLength(1);
    expect(all("SELECT id FROM contacts WHERE status = 'TO_VERIFY'")).toHaveLength(1);
  });

  it("contient une offre créée par un administrateur, sans déposant", () => {
    expect(all("SELECT id FROM offers WHERE depositor_contact_id IS NULL")).toHaveLength(1);
  });

  it("couvre tous les statuts d'offre sur les deux années", () => {
    expect(distinctValues("SELECT DISTINCT status AS value FROM offers")).toEqual(
      ["ARCHIVED", "ASSIGNED", "PENDING", "PUBLISHED", "SUBMITTED"],
    );
    expect(all("SELECT DISTINCT academic_year_id FROM offers")).toHaveLength(2);
  });

  it("couvre tous les statuts de candidature et une offre à plusieurs candidats", () => {
    expect(distinctValues("SELECT DISTINCT status AS value FROM applications")).toEqual(
      ["IN_PROGRESS", "REJECTED", "SELECTED", "WITHDRAWN"],
    );
    expect(
      all("SELECT offer_id FROM applications GROUP BY offer_id HAVING COUNT(*) >= 2").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("contient un stage issu d'une offre et un stage d'une autre année", () => {
    expect(all("SELECT id FROM internships WHERE offer_id IS NOT NULL").length).toBeGreaterThanOrEqual(1);
    expect(all("SELECT DISTINCT academic_year_id FROM internships")).toHaveLength(2);
  });
});

describe("cohérence métier du seed", () => {
  // Le rattachement du déposant et du promoteur à l'entreprise est garanti par le schéma.
  it("chaque déposant d'offre a le rôle DEPOSITOR", () => {
    const invalid = all(`
      SELECT depositor_contact_id FROM offers WHERE depositor_contact_id IS NOT NULL
      EXCEPT
      SELECT contact_id FROM contact_roles WHERE role = 'DEPOSITOR'`);

    expect(invalid).toEqual([]);
  });

  it("chaque promoteur d'offre ou de stage a le rôle PROMOTER (RG-11)", () => {
    const invalid = all(`
      SELECT promoter_contact_id FROM offers WHERE promoter_contact_id IS NOT NULL
      UNION
      SELECT promoter_contact_id FROM internships WHERE promoter_contact_id IS NOT NULL
      EXCEPT
      SELECT contact_id FROM contact_roles WHERE role = 'PROMOTER'`);

    expect(invalid).toEqual([]);
  });

  it("chaque contact est rattaché à au moins une entreprise (RG-08)", () => {
    expect(
      all(`SELECT id FROM contacts c
           WHERE NOT EXISTS (SELECT 1 FROM company_contacts cc WHERE cc.contact_id = c.id)`),
    ).toEqual([]);
  });

  it("les fiches « À vérifier » ne sont liées qu'à des stages déclarés (RG-13)", () => {
    const invalid = all(`
      SELECT i.id FROM internships i
      LEFT JOIN companies co ON co.id = i.company_id
      LEFT JOIN contacts ct ON ct.id = i.promoter_contact_id
      WHERE (co.status = 'TO_VERIFY' OR ct.status = 'TO_VERIFY') AND i.status <> 'DECLARED'`);

    expect(invalid).toEqual([]);
    expect(
      all(`SELECT o.id FROM offers o JOIN companies co ON co.id = o.company_id
           WHERE co.status = 'TO_VERIFY'`),
    ).toEqual([]);
  });

  it("un stage issu d'une sélection commence au statut « Validé »", () => {
    expect(
      all("SELECT status FROM internships WHERE id = ?", INTERNSHIP.MATEUSZ_DATAVIA),
    ).toEqual([{ status: "VALIDATED" }]);
  });

  it("le stage issu d'une offre correspond à l'offre attribuée et à la candidature retenue", () => {
    const internship = db
      .prepare(
        `SELECT i.student_id, i.company_id, i.academic_year_id, i.period_id,
                o.status AS offer_status, o.company_id AS offer_company_id,
                o.academic_year_id AS offer_year_id, o.period_id AS offer_period_id
         FROM internships i JOIN offers o ON o.id = i.offer_id
         WHERE i.id = ?`,
      )
      .get(INTERNSHIP.MATEUSZ_DATAVIA) as Record<string, unknown>;

    expect(internship.offer_status).toBe("ASSIGNED");
    expect(internship.company_id).toBe(internship.offer_company_id);
    expect(internship.academic_year_id).toBe(internship.offer_year_id);
    expect(internship.period_id).toBe(internship.offer_period_id);

    const applications = all<{ student_id: number; status: string }>(
      "SELECT student_id, status FROM applications WHERE offer_id = ?",
      OFFER.CLOUD_MIGRATION,
    );
    const selected = applications.filter((application) => application.status === "SELECTED");

    expect(selected).toEqual([{ student_id: internship.student_id, status: "SELECTED" }]);
    expect(applications.every((a) => a.status === "SELECTED" || a.status === "REJECTED")).toBe(true);
  });

  it("une offre attribuée a toujours un stage et une offre a au plus une candidature retenue", () => {
    expect(
      all(`SELECT o.id FROM offers o
           WHERE o.status = 'ASSIGNED'
             AND NOT EXISTS (SELECT 1 FROM internships i WHERE i.offer_id = o.id)`),
    ).toEqual([]);
    expect(
      all(`SELECT offer_id FROM applications WHERE status = 'SELECTED'
           GROUP BY offer_id HAVING COUNT(*) > 1`),
    ).toEqual([]);
  });

  // Le CdC autorise un stage à sortir de sa période (EF-71) ; le seed reste néanmoins aligné.
  it("les dates des stages du seed sont comprises dans leur période", () => {
    const invalid = all(`
      SELECT i.id FROM internships i JOIN periods p ON p.id = i.period_id
      WHERE i.start_date < p.start_date OR i.end_date > p.end_date`);

    expect(invalid).toEqual([]);
  });
});
