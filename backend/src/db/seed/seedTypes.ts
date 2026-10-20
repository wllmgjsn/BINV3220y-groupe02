// Lignes insérées par le seed. Les noms de propriétés sont ceux des colonnes SQL.

export interface AcademicYearRow {
  id: number;
  label: string;
  start_date: string;
  end_date: string;
  is_current: 0 | 1;
}

export interface PeriodRow {
  id: number;
  academic_year_id: number;
  code: "P1" | "P2" | "OTHER";
  start_date: string;
  end_date: string;
}

export interface CompanyRow {
  id: number;
  name: string;
  short_name: string;
  address: string | null;
  locality: string;
  status: "ACTIVE" | "TO_VERIFY" | "ARCHIVED";
  parent_company_id: number | null;
}

export interface ContactRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "TO_VERIFY" | "INACTIVE";
}

export type ContactRole = "DEPOSITOR" | "SIGNATORY" | "PROMOTER";

/** Contact et ses rôles, insérés dans contacts et contact_roles. */
export interface ContactSeed extends ContactRow {
  roles: ContactRole[];
}

export interface CompanyContactRow {
  company_id: number;
  contact_id: number;
}

export interface StudentRow {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cohort: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface AdministratorRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface OfferRow {
  id: number;
  company_id: number;
  depositor_contact_id: number | null;
  promoter_contact_id: number | null;
  academic_year_id: number;
  period_id: number;
  title: string;
  description: string;
  status: "SUBMITTED" | "PENDING" | "PUBLISHED" | "ASSIGNED" | "ARCHIVED";
  created_at: string;
  updated_at: string;
}

export interface ApplicationRow {
  id: number;
  offer_id: number;
  student_id: number;
  message: string | null;
  status: "IN_PROGRESS" | "SELECTED" | "REJECTED" | "WITHDRAWN";
  applied_at: string;
}

export interface InternshipRow {
  id: number;
  student_id: number;
  company_id: number;
  offer_id: number | null;
  subject: string;
  promoter_contact_id: number | null;
  supervisor_name: string | null;
  start_date: string;
  end_date: string;
  academic_year_id: number;
  period_id: number;
  status: "DECLARED" | "VALIDATED" | "COMPLETED" | "REFUSED" | "CANCELLED";
  refusal_reason: string | null;
}
