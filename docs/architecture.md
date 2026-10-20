# Architecture

Organisation du code de Gesta et parcours déjà implémentés.

## Vue d'ensemble

```text
gesta/
├── package.json        # workspaces npm et commandes communes
├── backend/            # API Express + SQLite
│   ├── API.md          # documentation des routes
│   ├── http/           # requêtes REST Client
│   ├── src/
│   └── tests/
├── frontend/           # application React (Vite)
│   ├── src/
│   └── tests/
└── docs/
```

En développement, le frontend appelle `/api/...`. Vite transmet ces requêtes au backend
(`http://localhost:3000`) en retirant le préfixe `/api`.

## Backend

```text
Requête HTTP
   ↓
main.ts → app.ts ─ middlewares (authenticate, authorize, errorHandler)
   ↓
controllers → services → repositories → SQLite
                 ↕
     mappers : DBO (ligne SQL) ↔ objet métier ↔ DTO (réponse de l'API)
```

| Dossier | Responsabilité |
|---|---|
| `main.ts` | Lit la configuration, initialise la base, démarre le serveur |
| `app.ts` | Crée l'application Express et branche routes et middlewares |
| `config.ts` | Variables d'environnement et garde du mode démo |
| `controllers/` | Routes, validation des paramètres et du corps, réponses HTTP |
| `services/` | Règles métier ; ne reçoivent jamais `Request` ni `Response` |
| `services/permissions.ts` | Règles d'accès nommées (`isAdmin`, `hasContactRole`, `canListOffers`…) |
| `repositories/` | Requêtes SQL ; retournent des DBO (données brutes) |
| `models/` | Types DBO, objets métier et DTO |
| `mappers/` | Conversions entre DBO, objets métier et DTO |
| `middlewares/` | `authenticate` (401), `authorize` (403), gestion centralisée des erreurs |
| `utils/` | `HttpError`, signature et vérification des jetons |
| `db/` | Connexion, migrations SQL, données de démonstration |

Chaque couche est créée par une fonction (`createCompaniesRepository(db)`,
`createCompaniesService(repository)`…) et assemblée dans `app.ts`. Les tests créent ainsi
une application complète sur une base SQLite en mémoire.

Une erreur se signale par `throw new HttpError(statut, code, message)`. Le middleware
`errorHandler` la transforme en réponse JSON `{ "error": { "code", "message" } }`.

### Base de données

- `db/migrations/NNN_nom.sql` : appliquées dans l'ordre de leur nom, une seule fois chacune
  (table `schema_migrations`). Pour faire évoluer le schéma, **ajoutez un nouveau fichier**
  (`002_….sql`) sans modifier les migrations existantes.
- Les clés étrangères, unicités et valeurs autorisées sont vérifiées par SQLite. Les règles
  métier (qui peut faire quoi, transitions de statut…) relèvent des services.
- Les statuts sont stockés en codes anglais (`PUBLISHED`) ; le frontend affiche les
  libellés français.
- `db/seed/` contient les données de démonstration, décrites dans [seed.md](seed.md).
  `seedIds.ts` donne un nom stable à chaque identifiant, utilisable dans les tests.

### Identification et droits

1. `POST /auth/demo-login` retourne un jeton qui ne contient que l'identité (`kind`, `id`).
2. Le frontend l'envoie dans l'en-tête `Authorization` de chaque requête.
3. `authenticate` vérifie le jeton, puis **relit en base** le compte, ses rôles et ses
   entreprises (`req.user`). Absent, invalide ou compte inactif : 401.
4. `authorize(règle)` refuse la requête avec un 403 si la règle n'est pas respectée.
5. Le service filtre les données selon l'utilisateur (par exemple, les offres visibles).

## Frontend

Le frontend suit le modèle MVVM du cours.

```text
pages → hooks → services ou utils → models
  ↓
components
```

| Dossier | Responsabilité |
|---|---|
| `models/` | Types des données reçues de l'API |
| `services/` | Appels HTTP ; vérifient le statut et valident le JSON avec un type guard |
| `utils/` | `readJson`, type guards, libellés français, stockage du jeton, règles d'affichage |
| `hooks/` | État prêt à afficher (`useCompanies`, `useOffers`…) et session (`useAuth`) |
| `components/` | Composants réutilisables, sans connaissance des routes |
| `pages/` | Une page par route ; assemble hooks et composants |
| `App.tsx` | Session (appel unique de `useAuth`) et routes |

`useAuth` est appelé une seule fois, dans `App`. Le jeton et la fonction de déconnexion
sont transmis aux pages par les props. Sur une réponse 401, les hooks appellent
`onUnauthorized` et l'utilisateur revient à l'écran de connexion.

## Parcours de référence

Deux fonctionnalités traversent toutes les couches. Elles servent de modèle pour les
nouvelles.

### Liste des entreprises

| Couche | Fichier |
|---|---|
| Route | `backend/src/controllers/companies.controller.ts` (`GET /companies?q=`) |
| Service | `backend/src/services/companies.service.ts` (entreprises actives pour les non-administrateurs) |
| Repository | `backend/src/repositories/companies.repository.ts` |
| Modèles et mapper | `backend/src/models/company.ts`, `backend/src/mappers/company.mapper.ts` |
| Tests API | `backend/tests/companies.test.ts` |
| Service frontend | `frontend/src/services/companies.service.ts` |
| Hook | `frontend/src/hooks/useCompanies.ts` (délai de frappe, annulation) |
| Page et composants | `frontend/src/pages/CompaniesPage.tsx`, `CompanyTable.tsx`, `SearchField.tsx` |
| Tests interface | `frontend/tests/CompaniesPage.test.tsx` |

### Liste des offres selon le profil

| Couche | Fichier |
|---|---|
| Route | `backend/src/controllers/offers.controller.ts` (`GET /offers`, `authorize(canListOffers)`) |
| Service | `backend/src/services/offers.service.ts` (visibilité selon le profil) |
| Repository | `backend/src/repositories/offers.repository.ts` (jointures entreprise, année, période) |
| Modèles et mapper | `backend/src/models/offer.ts`, `backend/src/mappers/offer.mapper.ts` |
| Tests API | `backend/tests/offers.test.ts` |
| Service frontend | `frontend/src/services/offers.service.ts` |
| Hook | `frontend/src/hooks/useOffers.ts` |
| Page et composants | `frontend/src/pages/OffersPage.tsx`, `OfferTable.tsx` |
| Tests interface | `frontend/tests/OffersPage.test.tsx`, `NavBar.test.tsx` |

## Tests

- Backend (`backend/tests/`) : Vitest et Supertest sur une base SQLite en mémoire, jamais
  sur la base de développement. `tests/helpers/testApp.ts` crée l'application ;
  `tokenFor(kind, id)` fournit un jeton pour un utilisateur du seed.
- Frontend (`frontend/tests/`) : Vitest et Testing Library ; `tests/helpers/fetchMock.ts`
  simule les réponses de l'API.

## Conventions particulières

- Les imports relatifs du backend se terminent par `.ts` : TypeScript les réécrit en
  `.js` à la compilation.
- Le jeton est envoyé tel quel dans l'en-tête `Authorization`, sans préfixe `Bearer`.
- Le port de l'API se règle avec `API_PORT` (et non `PORT`).
