import type { Db } from "../db/database.ts";
import type { OfferDbo, OfferStatus, PeriodCode } from "../models/offer.ts";

interface OfferRemovalData {
  id: number;
  status: OfferStatus;
  depositor_contact_id: number | null;
}

export type OfferRemovalActor =
  | { kind: "ADMIN" }
  | { kind: "DEPOSITOR"; contactId: number };

export interface OfferFilter {
  /** Texte cherché dans le titre. */
  search?: string;
  /** Limite aux offres de ce statut. */
  status?: OfferStatus;
  /** Limite aux offres déposées par ce contact. */
  depositorContactId?: number;
  /** Limite aux offres de cette période. */
  period?: PeriodCode;
}

interface FindAllParams {
  pattern: string | null;
  status: OfferStatus | null;
  depositorContactId: number | null;
  periodCode: PeriodCode | null;
}

const escapeLike = (text: string): string => text.replace(/[\\%_]/g, (char) => `\\${char}`);

export const createOffersRepository = (db: Db) => {
  const findAll = db.prepare<FindAllParams, OfferDbo>(`
    SELECT o.id, o.title, o.description, o.status,
           o.company_id, c.short_name AS company_short_name,
           o.depositor_contact_id,
           ay.label AS academic_year_label, p.code AS period_code,
           o.created_at, o.updated_at
    FROM offers o
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE (@status IS NULL OR o.status = @status)
      AND (@depositorContactId IS NULL OR o.depositor_contact_id = @depositorContactId)
      AND (@periodCode IS NULL OR p.code = @periodCode)
      AND (@pattern IS NULL OR o.title LIKE @pattern ESCAPE '\\')
    ORDER BY ay.start_date DESC, o.created_at DESC
  `);
  const findForRemoval = db.prepare<{ offerId: number }, OfferRemovalData>(`
    SELECT id, status, depositor_contact_id
    FROM offers
    WHERE id = @offerId
  `);
  const hasInternship = db.prepare<{ offerId: number }, { id: number }>(`
    SELECT id
    FROM internships
    WHERE offer_id = @offerId
  `);
  const deleteApplications = db.prepare<{ offerId: number }>(
    "DELETE FROM applications WHERE offer_id = @offerId",
  );
  const deleteOffer = db.prepare<{ offerId: number }>("DELETE FROM offers WHERE id = @offerId");
  const remove = db.transaction(
    (
      offerId: number,
      actor: OfferRemovalActor,
    ): "NOT_FOUND" | "FORBIDDEN" | "NOT_REMOVABLE" | "HAS_INTERNSHIP" | "REMOVED" => {
      const offer = findForRemoval.get({ offerId });
      if (offer === undefined) return "NOT_FOUND";
      if (actor.kind === "DEPOSITOR") {
        if (offer.depositor_contact_id !== actor.contactId) return "FORBIDDEN";
        if (offer.status !== "SUBMITTED" && offer.status !== "PENDING") return "NOT_REMOVABLE";
      }
      if (hasInternship.get({ offerId }) !== undefined) return "HAS_INTERNSHIP";

      deleteApplications.run({ offerId });
      deleteOffer.run({ offerId });
      return "REMOVED";
    },
  );

  return {
    /** Offres correspondant au filtre, de la plus récente année à la plus ancienne. */
    findAll: ({ search, status, depositorContactId, period }: OfferFilter): OfferDbo[] =>
      findAll.all({
        pattern: search === undefined ? null : `%${escapeLike(search)}%`,
        status: status ?? null,
        depositorContactId: depositorContactId ?? null,
        periodCode: period ?? null,
      }),

    remove: (
      offerId: number,
      actor: OfferRemovalActor,
    ): "NOT_FOUND" | "FORBIDDEN" | "NOT_REMOVABLE" | "HAS_INTERNSHIP" | "REMOVED" =>
      remove.immediate(offerId, actor),
  };
};

export type OffersRepository = ReturnType<typeof createOffersRepository>;
