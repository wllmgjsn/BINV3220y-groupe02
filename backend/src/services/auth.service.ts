import { toUser } from "../mappers/user.mapper.ts";
import type { User, UserDbo, UserKind } from "../models/user.ts";
import type { UsersRepository } from "../repositories/users.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { signToken, verifyToken } from "../utils/token.ts";

/** Seuls les comptes actifs se connectent ; un contact doit avoir au moins un rôle (CdC § 4.2). */
const canSignIn = (dbo: UserDbo): boolean =>
  dbo.person.status === "ACTIVE" && (dbo.kind !== "CONTACT" || dbo.roles.length > 0);

const unauthorized = () =>
  new HttpError(401, "UNAUTHENTICATED", "Session absente, expirée ou invalide");

export const createAuthService = (repository: UsersRepository, jwtSecret: string) => {
  const findSignInUser = (kind: UserKind, id: number): User | undefined => {
    const dbo = repository.findById(kind, id);
    return dbo !== undefined && canSignIn(dbo) ? toUser(dbo) : undefined;
  };

  return {
    /** Utilisateurs proposés par l'écran de connexion de démo. */
    listDemoUsers: (): User[] =>
      (["ADMIN", "STUDENT", "CONTACT"] as const).flatMap((kind) =>
        repository.listByKind(kind).filter(canSignIn).map(toUser),
      ),

    demoSignIn: (kind: UserKind, id: number): { token: string; user: User } => {
      const user = findSignInUser(kind, id);
      if (user === undefined) {
        throw new HttpError(401, "UNAUTHENTICATED", "Cet utilisateur ne peut pas se connecter");
      }
      return { token: signToken({ kind, id }, jwtSecret), user };
    },

    /** Identifie l'auteur d'une requête en relisant toujours ses droits en base. */
    authenticate: (token: string | undefined): User => {
      const payload = token === undefined ? undefined : verifyToken(token, jwtSecret);
      const user = payload === undefined ? undefined : findSignInUser(payload.kind, payload.id);
      if (user === undefined) {
        throw unauthorized();
      }
      return user;
    },
  };
};

export type AuthService = ReturnType<typeof createAuthService>;
