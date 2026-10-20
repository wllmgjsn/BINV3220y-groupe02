import { vi } from "vitest";
import type { User } from "../../src/models/user.ts";

type Responder = () => Response;

/**
 * Remplace fetch par des réponses choisies selon le début de l'URL appelée.
 * Chaque appel crée une nouvelle Response : son corps ne se lit qu'une fois.
 */
export const stubFetch = (routes: Record<string, Responder>) => {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const prefix = Object.keys(routes)
      .sort((a, b) => b.length - a.length)
      .find((candidate) => url.startsWith(candidate));
    const responder = prefix === undefined ? undefined : routes[prefix];
    return Promise.resolve(responder ? responder() : new Response(null, { status: 404 }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

export const studentUser: User = {
  kind: "STUDENT",
  id: 3,
  firstName: "Mateusz",
  lastName: "Kowalski",
  email: "mateusz.kowalski@etu.gesta.test",
  roles: [],
  companies: [],
};

export const contactUser: User = {
  kind: "CONTACT",
  id: 4,
  firstName: "Julien",
  lastName: "Lambert",
  email: "julien.lambert@lumen.test",
  roles: ["DEPOSITOR", "PROMOTER"],
  companies: [
    { id: 3, shortName: "Lumen Data" },
    { id: 2, shortName: "Lumen Digital" },
  ],
};

export const adminUser: User = {
  kind: "ADMIN",
  id: 1,
  firstName: "Anne",
  lastName: "Leclercq",
  email: "anne.leclercq@gesta.test",
  roles: [],
  companies: [],
};

export const promoterUser: User = {
  kind: "CONTACT",
  id: 3,
  firstName: "Nadia",
  lastName: "Cherif",
  email: "nadia.cherif@orbis.test",
  roles: ["PROMOTER", "SIGNATORY"],
  companies: [{ id: 4, shortName: "Orbis" }],
};
