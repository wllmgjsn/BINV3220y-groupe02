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
├── docs/               # documentation du projet
└── README.md
```

Le dépôt suit une architecture de type monorepo léger avec deux applications cohabitant dans un même repository :

- `backend/` : API REST, logique métier, accès SQLite et règles d'autorisation
- `frontend/` : interface utilisateur React/Vite qui consomme l'API
- `docs/` : documentation de conception, architecture et données de démonstration

En développement, le frontend appelle `/api/...`. Vite transmet ces requêtes au backend
(`http://localhost:3000`) en retirant le préfixe `/api`.

## Architecture fonctionnelle

### 1) Backend : API et logique métier

Le backend est organisé selon un pattern de couches classique pour faciliter la compréhension et la maintenance :

```text
Requête HTTP
  ↓
main.ts → app.ts → middlewares (authenticate, authorize, errorHandler)
  ↓
controllers → services → repositories → SQLite
  ↕
models / mappers / DTOs
```

Les rôles de chaque dossier sont les suivants :

- `main.ts` : charge la configuration, initialise la base de données et démarre le serveur
- `app.ts` : assemble l'application Express, branche les routes et les middlewares
- `config.ts` : variables d'environnement et mode démo
- `controllers/` : réception des requêtes HTTP, validation simple, réponse JSON
- `services/` : logique métier et règles d'accès ; les services ne reçoivent ni `Request`, ni `Response`
- `repositories/` : accès direct à SQLite en SQL brut
- `models/` : types DBO, modèles métier et DTO
- `mappers/` : conversion DBO ↔ objet métier ↔ DTO
- `middlewares/` : authentification, autorisation et gestion centralisée des erreurs
- `utils/` : helpers (`HttpError`, JWT, validations, utilitaires partagés)
- `db/` : connexion, migrations, seed et scripts d'initialisation

### 2) Frontend : interface utilisateur et session

Le frontend est construit autour d'une séparation claire entre le rendu, l'état de session et les appels HTTP :

```text
pages → hooks → services ou utils → models
  ↓
components
```

Principes observés dans le code :

- `App.tsx` appelle `useAuth()` une seule fois et transmet le contexte de session aux pages
- `pages/` contient les écrans et l'assemblage final des composants
- `hooks/` encapsule les états chargés/données et la logique de récupération
- `services/` effectue les requêtes API et vérifie les réponses
- `utils/` contient les helpers, les permissions front, les libellés et le stockage du token
- `components/` regroupe les blocs UI réutilisables et sans logique de navigation

### 3) Flux d'authentification et de permissions

Un point central du projet est le mécanisme d'authentification et de droits :

1. `POST /auth/demo-login` retourne un JWT minimal (identité uniquement)
2. Le frontend envoie le token dans l'en-tête `Authorization`
3. `authenticate` vérifie le jeton puis relit le compte en base pour reconstruire `req.user`
4. `authorize()` applique les règles métier dans le backend
5. Les services filtrent les données selon le profil utilisateur

Ce mécanisme évite que le client puisse modifier ses droits côté navigateur. La logique de permission est centralisée côté serveur.

## Base de données

La base est SQLite avec `better-sqlite3`, sans ORM. Le schéma est construit avec des migrations SQL :

- `backend/src/db/migrations/NNN_nom.sql` : fichiers exécutés dans l'ordre numérique
- Chaque migration est appliquée une seule fois via `schema_migrations`
- Les règles métier (états, autorisations, transitions) sont gérées dans les services, pas seulement dans SQLite

Le projet utilise aussi un `seed` pour initialiser les données de démonstration, avec des identifiants stables afin de fiabiliser les tests.

## Tests

La structure de test est cohérente avec l'organisation générale :

- `backend/tests/` : tests API avec Vitest + Supertest, sur une base SQLite en mémoire
- `frontend/tests/` : tests UI avec Vitest + Testing Library

Les tests couvrent les parcours d'API et les écrans déjà implémentés, notamment les listes d'entreprises et d'offres.

## Conventions spécifiques au projet

- Les imports TypeScript du backend utilisent explicitement l'extension `.ts`
- Le port de l'API est configuré avec `API_PORT` et non `PORT`
- Le token n'est pas envoyé avec le préfixe `Bearer` ; le backend l'attend tel quel dans `Authorization`
- Le mode de démonstration (`DEMO_AUTH_ENABLED=true`) est réservé au développement local
- Les migrations ne doivent pas être modifiées après leur création ; on ajoute un nouveau fichier en cas d'évolution

## Parcours de référence

Deux parcours traversent toutes les couches et servent de modèle pour de nouvelles fonctionnalités :

- `GET /companies` : route backend, service, repository, mapper, hook frontend et page d'affichage
- `GET /offers` : même structure avec filtrage par rôle et autorisation

Ces flux sont les meilleurs exemples à suivre pour implémenter une nouvelle fonctionnalité dans ce projet.

## Conclusion

Le projet s'organise autour d'un partage net des responsabilités :

- backend pour la logique, la sécurité et le stockage
- frontend pour l'affichage et l'interaction utilisateur
- tests pour valider les parcours métier et la UI

Cette séparation rend le code plus lisible et facilite l'ajout de nouvelles fonctionnalités en suivant les mêmes conventions déjà présentes dans les modules existants.

## Fichiers clés à consulter

- `README.md` : installation, commandes et contexte métier du projet
- `backend/src/main.ts` : point d'entrée du serveur API et initialisation de la base
- `backend/src/app.ts` : assemblage des middlewares et des routes Express
- `backend/src/services/permissions.ts` : règles d'accès centralisées
- `frontend/src/App.tsx` : session utilisateur et navigation
- `backend/src/db/migrations/` : schéma SQLite et évolution du modèle de données

Les parcours de référence sont les listes d'entreprises et d'offres : ils traversent toutes les couches du projet (route, service, repository, mapper, hook, page et tests) et offrent le meilleur modèle pour ajouter une nouvelle fonctionnalité.
