import { openDatabase } from "../../../backend/src/db/database.ts";
import { runMigrations } from "../../../backend/src/db/migrate.ts";
import { seedDatabase } from "../../../backend/src/db/seed/seed.ts";
import { OFFER, STUDENT } from "../../../backend/src/db/seed/seedIds.ts";

const databasePath = process.env.DATABASE_PATH;
if (databasePath === undefined) {
  throw new Error("DATABASE_PATH doit désigner la base SQLite E2E isolée");
}

const db = openDatabase(databasePath);
try {
  runMigrations(db);
  seedDatabase(db);

  const insertApplication = db.prepare(`
    INSERT INTO applications (id, offer_id, student_id, message, status, applied_at)
    VALUES (@id, @offerId, @studentId, @message, @status, @appliedAt)
  `);
  insertApplication.run({
    id: 9001,
    offerId: OFFER.INTERNAL_CHATBOT,
    studentId: STUDENT.LOUIS_CLAES,
    message: "Candidature E2E en cours",
    status: "IN_PROGRESS",
    appliedAt: "2026-10-10 09:00:00",
  });
  insertApplication.run({
    id: 9002,
    offerId: OFFER.DATA_QUALITY,
    studentId: STUDENT.LOUIS_CLAES,
    message: null,
    status: "WITHDRAWN",
    appliedAt: "2026-10-11 09:00:00",
  });
} finally {
  db.close();
}
