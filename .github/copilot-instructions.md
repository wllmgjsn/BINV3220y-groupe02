# Copilot instructions for Gesta

This repository is a full-stack course project for internship management. The root workspace orchestrates two packages: `backend/` (Express + TypeScript + SQLite) and `frontend/` (React + TypeScript + Vite). The most important source of truth for behavior and intended architecture is the root README plus `docs/architecture.md`.

## Local setup and commands

- Node.js requirement: `>=22.14.0` (Node 24 LTS recommended). The project handles version checks in startup code.
- Install dependencies from the repo root:
  ```bash
  npm ci
  ```
- One-time initialization for env and demo database:
  ```bash
  npm run setup
  ```
- Start the app locally:
  ```bash
  npm run dev
  ```
- The app runs at:
  - API: `http://localhost:3000`
  - Frontend: `http://localhost:5173`

Important repo-specific setup facts:
- `.npmrc` intentionally sets `ignore-scripts=true` to avoid running native build steps for `better-sqlite3` during install. Do not remove this unless a dependency change truly requires it.
- `npm run setup` creates `backend/.env` with a JWT secret and initializes the SQLite database with demo data.
- `npm run db:reset` and `npm run db:init` are the safe database commands; use them instead of manually deleting DB files.

## Root-level commands

Use these from the repository root:

```bash
npm run dev            # backend + frontend in parallel
npm run setup          # prepare env and database
npm run db:init        # initialize or update the database
npm run db:reset       # recreate the database with demo data
npm run lint           # lint all workspaces
npm run typecheck      # type-check all workspaces
npm test               # run all workspace tests
npm run build          # build backend and frontend
npm run check          # lint + typecheck + tests + build
```

## Single-file or single-test execution

Prefer the smallest relevant command when changing a single area:

```bash
# backend
npm run lint -w backend
npm run typecheck -w backend
npm test -w backend -- tests/companies.test.ts
npm test -w backend -- tests/offers.test.ts

# frontend
npm run lint -w frontend
npm run typecheck -w frontend
npm test -w frontend -- tests/CompaniesPage.test.tsx
npm test -w frontend -- tests/OffersPage.test.tsx
```

When adding or changing a feature, run the tests that cover the affected route, page, or permission flow rather than the whole suite.

## High-level architecture

### Backend

The backend follows a layered structure:

```text
HTTP request
  ↓
main.ts → app.ts → middlewares (authenticate, authorize, errorHandler)
  ↓
controllers → services → repositories → SQLite
  ↕
models / mappers / DTOs
```

Key points:
- `backend/src/controllers/` handles route-level validation and HTTP responses.
- `backend/src/services/` holds business logic and authorization decisions. Services should not accept `Request`/`Response` objects.
- `backend/src/repositories/` owns SQL access and returns raw DB rows / DBO structures.
- `backend/src/models/` and `backend/src/mappers/` convert between DB rows, domain objects, and API DTOs.
- `backend/src/middlewares/` centralizes authentication, authorization, and error conversion.
- `backend/src/db/migrations/` contains numbered SQL migration files; do not rewrite existing migration files. Add a new one for schema changes.

The repo-specific authorization flow is important:
1. `POST /auth/demo-login` returns a JWT containing only identity info.
2. The frontend sends the token in the `Authorization` header.
3. `authenticate` validates the token and reloads the user from SQLite before each request.
4. `authorize(rule)` rejects requests with 403 when the user lacks permission.
5. Services filter what the user can see based on profile/role.

### Frontend

The frontend follows the course MVVM pattern:

```text
pages → hooks → services/utils → models
  ↓
components
```

Key points:
- `frontend/src/pages/` contains page-level assembly.
- `frontend/src/hooks/` contains stateful hooks, especially auth/session and data-fetching hooks.
- `frontend/src/services/` wraps HTTP calls and performs JSON validation with type guards.
- `frontend/src/utils/` contains shared display logic, permission helpers, token storage, and type guards.
- `App.tsx` calls `useAuth()` once and passes session state down through routes.
- Vite proxies `/api/*` to `http://localhost:3000` during local development.

## Key repository conventions

- Use the same route/service/repository layering when adding a feature. Do not bypass the service or repository layers for a new API flow.
- Keep permissions centralized in the backend; reuse named rules like `canListOffers` rather than duplicating the logic in the frontend.
- When creating a backend import, use explicit `.ts` extensions in source files (`import ... from "./x.ts"`).
- For JWT-based requests, the token is sent as-is in the `Authorization` header; do not add a `Bearer ` prefix.
- API configuration uses `API_PORT`, not `PORT`.
- The project uses demo auth for local development; the server refuses to start with `DEMO_AUTH_ENABLED=true` when `NODE_ENV=production`.
- Tests in both workspaces use Vitest. Backend API tests create a full app on an in-memory SQLite database rather than using the dev DB.
- `HttpError` is the standard way to report domain errors; central middleware turns it into a JSON `{ error: { code, message } }` response.
- The "reference implementations" for cross-layer work are: companies and offers lists. Follow those patterns when adding new feature flows.

## Files and docs to consult

Before making a broad change, read the relevant files from these project docs:
- `README.md`
- `docs/architecture.md`
- `backend/API.md`
- `docs/seed.md`

The repo’s work is intentionally incomplete by design; prefer the existing patterns in the implemented features rather than introducing a new app structure.
