-- Schéma initial de Gesta.
-- Les contraintes structurelles sont appliquées par SQLite (clés étrangères, unicité,
-- valeurs autorisées). Les règles métier conditionnelles (transitions d'état, droit de
-- candidater, rôle exigé pour une action...) relèvent des services du backend.
-- Les statuts sont stockés sous forme de codes anglais ; les libellés français sont
-- produits par le frontend.

-- Années académiques et périodes ----------------------------------------------

CREATE TABLE academic_years (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 0 CHECK (is_current IN (0, 1)),
  CHECK (start_date < end_date)
) STRICT;

-- Une seule année académique peut être l'année courante.
CREATE UNIQUE INDEX academic_years_single_current
  ON academic_years (is_current) WHERE is_current = 1;

CREATE TABLE periods (
  id INTEGER PRIMARY KEY,
  academic_year_id INTEGER NOT NULL REFERENCES academic_years (id),
  code TEXT NOT NULL CHECK (code IN ('P1', 'P2', 'OTHER')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  CHECK (start_date < end_date),
  UNIQUE (academic_year_id, code),
  -- Cible des clés étrangères composites : une période appartient à son année.
  UNIQUE (id, academic_year_id)
) STRICT;

-- Entreprises et contacts -----------------------------------------------------

CREATE TABLE companies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (trim(name) <> ''),
  short_name TEXT NOT NULL CHECK (trim(short_name) <> ''),
  address TEXT,
  locality TEXT NOT NULL CHECK (trim(locality) <> ''),
  -- TO_VERIFY : fiche créée par un étudiant, à confirmer par un administrateur.
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TO_VERIFY', 'ARCHIVED')),
  parent_company_id INTEGER REFERENCES companies (id),
  CHECK (parent_company_id IS NULL OR parent_company_id <> id)
) STRICT;

CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TO_VERIFY', 'INACTIVE'))
) STRICT;

-- Rattachement plusieurs-à-plusieurs : une paire (entreprise, contact) n'existe qu'une fois.
CREATE TABLE company_contacts (
  company_id INTEGER NOT NULL REFERENCES companies (id),
  contact_id INTEGER NOT NULL REFERENCES contacts (id),
  PRIMARY KEY (company_id, contact_id)
) STRICT;

-- Rôles cumulables du contact. Ils s'exercent dans toutes les entreprises auxquelles
-- il est rattaché. Un contact sans rôle reste enregistré mais ne peut pas se connecter.
CREATE TABLE contact_roles (
  contact_id INTEGER NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('DEPOSITOR', 'SIGNATORY', 'PROMOTER')),
  PRIMARY KEY (contact_id, role)
) STRICT;

-- Étudiants et administrateurs --------------------------------------------------

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  student_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  -- Cohorte reprise telle quelle de l'export Gesta.
  cohort TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
) STRICT;

CREATE TABLE administrators (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
) STRICT;

-- Offres, candidatures et stages ----------------------------------------------

-- Une offre correspond à une seule place de stage.
CREATE TABLE offers (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies (id),
  -- Facultatif : un administrateur peut créer une offre au nom d'une entreprise.
  depositor_contact_id INTEGER,
  promoter_contact_id INTEGER,
  academic_year_id INTEGER NOT NULL,
  period_id INTEGER NOT NULL,
  title TEXT NOT NULL CHECK (trim(title) <> ''),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED'
    CHECK (status IN ('SUBMITTED', 'PENDING', 'PUBLISHED', 'ASSIGNED', 'ARCHIVED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- Seule trace conservée des modifications : pas d'historique des statuts.
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- Le déposant et le promoteur éventuel sont rattachés à l'entreprise de l'offre.
  FOREIGN KEY (company_id, depositor_contact_id)
    REFERENCES company_contacts (company_id, contact_id),
  FOREIGN KEY (company_id, promoter_contact_id)
    REFERENCES company_contacts (company_id, contact_id),
  -- La période appartient à l'année académique de l'offre.
  FOREIGN KEY (period_id, academic_year_id) REFERENCES periods (id, academic_year_id)
) STRICT;

CREATE INDEX offers_company ON offers (company_id);
CREATE INDEX offers_status ON offers (status);

CREATE TABLE applications (
  id INTEGER PRIMARY KEY,
  offer_id INTEGER NOT NULL REFERENCES offers (id),
  student_id INTEGER NOT NULL REFERENCES students (id),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS'
    CHECK (status IN ('IN_PROGRESS', 'SELECTED', 'REJECTED', 'WITHDRAWN')),
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE INDEX applications_offer ON applications (offer_id);
CREATE INDEX applications_student ON applications (student_id);

CREATE TABLE internships (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students (id),
  company_id INTEGER NOT NULL REFERENCES companies (id),
  -- Stage issu d'une offre (au plus un stage par offre) ou déclaré par l'étudiant.
  offer_id INTEGER UNIQUE REFERENCES offers (id),
  subject TEXT NOT NULL CHECK (trim(subject) <> ''),
  promoter_contact_id INTEGER,
  -- Professeur qui suit le stage : simple nom, les professeurs n'ont pas de compte.
  supervisor_name TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  academic_year_id INTEGER NOT NULL,
  period_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DECLARED'
    CHECK (status IN ('DECLARED', 'VALIDATED', 'COMPLETED', 'REFUSED', 'CANCELLED')),
  -- Motif visible par l'étudiant quand un stage déclaré est refusé.
  refusal_reason TEXT,
  CHECK (start_date < end_date),
  FOREIGN KEY (company_id, promoter_contact_id)
    REFERENCES company_contacts (company_id, contact_id),
  FOREIGN KEY (period_id, academic_year_id) REFERENCES periods (id, academic_year_id)
) STRICT;

CREATE INDEX internships_student ON internships (student_id);
