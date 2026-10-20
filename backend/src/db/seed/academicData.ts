import { ACADEMIC_YEAR, PERIOD } from "./seedIds.ts";
import type { AcademicYearRow, PeriodRow } from "./seedTypes.ts";

export const academicYears: AcademicYearRow[] = [
  {
    id: ACADEMIC_YEAR.Y2025_2026,
    label: "2025-2026",
    start_date: "2025-09-15",
    end_date: "2026-06-30",
    is_current: 0,
  },
  {
    id: ACADEMIC_YEAR.Y2026_2027,
    label: "2026-2027",
    start_date: "2026-09-14",
    end_date: "2027-06-30",
    is_current: 1,
  },
];

// Périodes par défaut du CdC : P1 de septembre à décembre, P2 de février à mai, OTHER.
export const periods: PeriodRow[] = [
  {
    id: PERIOD.Y2025_2026_P1,
    academic_year_id: ACADEMIC_YEAR.Y2025_2026,
    code: "P1",
    start_date: "2025-09-15",
    end_date: "2025-12-19",
  },
  {
    id: PERIOD.Y2025_2026_P2,
    academic_year_id: ACADEMIC_YEAR.Y2025_2026,
    code: "P2",
    start_date: "2026-02-09",
    end_date: "2026-05-29",
  },
  {
    id: PERIOD.Y2025_2026_OTHER,
    academic_year_id: ACADEMIC_YEAR.Y2025_2026,
    code: "OTHER",
    start_date: "2025-09-15",
    end_date: "2026-06-30",
  },
  {
    id: PERIOD.Y2026_2027_P1,
    academic_year_id: ACADEMIC_YEAR.Y2026_2027,
    code: "P1",
    start_date: "2026-09-14",
    end_date: "2026-12-18",
  },
  {
    id: PERIOD.Y2026_2027_P2,
    academic_year_id: ACADEMIC_YEAR.Y2026_2027,
    code: "P2",
    start_date: "2027-02-08",
    end_date: "2027-05-28",
  },
  {
    id: PERIOD.Y2026_2027_OTHER,
    academic_year_id: ACADEMIC_YEAR.Y2026_2027,
    code: "OTHER",
    start_date: "2026-09-14",
    end_date: "2027-06-30",
  },
];
