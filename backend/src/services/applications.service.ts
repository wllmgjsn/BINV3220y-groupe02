import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

const requireStudent = (user: User): void => {
  if (!isStudent(user)) {
    throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut gérer ses candidatures");
  }
};

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  listApplications: (user: User): Application[] => {
    requireStudent(user);
    return repository.findByStudent(user.id).map(toApplication);
  },

  apply: (user: User, offerId: number, message: string | null): Application => {
    requireStudent(user);

    const result = repository.createIfAllowed({ offerId, studentId: user.id, message });
    if (result === "OFFER_NOT_PUBLISHED") {
      throw new HttpError(409, "OFFER_NOT_PUBLISHED", "Cette offre n'est pas publiée");
    }
    if (result === "ALREADY_APPLIED") {
      throw new HttpError(409, "ALREADY_APPLIED", "Vous avez déjà une candidature non retirée");
    }

    const created = repository.findByStudent(user.id).find(
      (application) => application.offer_id === offerId && application.status === "IN_PROGRESS",
    );
    if (created === undefined) {
      throw new Error("La candidature créée est introuvable");
    }
    return toApplication(created);
  },

  withdraw: (user: User, applicationId: number): void => {
    requireStudent(user);

    const application = repository.findOneByStudent(user.id, applicationId);
    if (application === undefined) {
      throw new HttpError(404, "APPLICATION_NOT_FOUND", "Candidature introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_ALREADY_PROCESSED", "Cette candidature a déjà été traitée");
    }

    if (!repository.withdraw(user.id, applicationId)) {
      const currentStatus = repository.findStatus(user.id, applicationId);
      if (currentStatus === undefined) {
        throw new HttpError(404, "APPLICATION_NOT_FOUND", "Candidature introuvable");
      }
      if (currentStatus !== "IN_PROGRESS") {
        throw new HttpError(
          409,
          "APPLICATION_ALREADY_PROCESSED",
          "Cette candidature a déjà été traitée",
        );
      }
      throw new Error("La candidature n'a pas pu être retirée");
    }
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
