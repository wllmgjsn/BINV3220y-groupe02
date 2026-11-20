import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationStatus } from "../models/application.ts";

interface FindByStudentParams {
  studentId: number;
  applicationId: number | null;
}

interface InsertParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

export type CreateApplicationResult = "OFFER_NOT_PUBLISHED" | "ALREADY_APPLIED" | "CREATED";

const isUniqueConstraintError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "SQLITE_CONSTRAINT_UNIQUE";

export const createApplicationsRepository = (db: Db) => {
  const findByStudent = db.prepare<FindByStudentParams, ApplicationDbo>(`
    SELECT a.id, a.offer_id, o.title AS offer_title,
           c.short_name AS company_short_name, a.message, a.status, a.applied_at
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    WHERE a.student_id = @studentId
      AND (@applicationId IS NULL OR a.id = @applicationId)
    ORDER BY a.applied_at DESC, a.id DESC
  `);
  const findOfferStatus = db.prepare<{ offerId: number }, { status: string }>(
    "SELECT status FROM offers WHERE id = @offerId",
  );
  const findActive = db.prepare<{ offerId: number; studentId: number }, { id: number }>(`
    SELECT id FROM applications
    WHERE offer_id = @offerId AND student_id = @studentId AND status <> 'WITHDRAWN'
  `);
  const insert = db.prepare<InsertParams>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
  `);
  const withdraw = db.prepare<{ applicationId: number; studentId: number }>(`
    UPDATE applications SET status = 'WITHDRAWN'
    WHERE id = @applicationId AND student_id = @studentId AND status = 'IN_PROGRESS'
  `);

  const createIfAllowed = db.transaction(
    ({ offerId, studentId, message }: InsertParams): CreateApplicationResult => {
      if (findOfferStatus.get({ offerId })?.status !== "PUBLISHED") {
        return "OFFER_NOT_PUBLISHED";
      }
      if (findActive.get({ offerId, studentId }) !== undefined) {
        return "ALREADY_APPLIED";
      }

      try {
        insert.run({ offerId, studentId, message });
      } catch (error) {
        if (isUniqueConstraintError(error)) return "ALREADY_APPLIED";
        throw error;
      }
      return "CREATED";
    },
  );

  return {
    findByStudent: (studentId: number): ApplicationDbo[] =>
      findByStudent.all({ studentId, applicationId: null }),

    findOneByStudent: (studentId: number, applicationId: number): ApplicationDbo | undefined =>
      findByStudent.get({ studentId, applicationId }),

    createIfAllowed: (params: InsertParams): CreateApplicationResult => createIfAllowed(params),

    withdraw: (studentId: number, applicationId: number): boolean =>
      withdraw.run({ studentId, applicationId }).changes === 1,

    findStatus: (studentId: number, applicationId: number): ApplicationStatus | undefined =>
      findByStudent.get({ studentId, applicationId })?.status,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
