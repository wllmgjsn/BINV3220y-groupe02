# Gesta — projet de départ

Application web de gestion des stages, développée à partir de ce dépôt pendant les séances
du cours. Le dépôt fonctionne dès l'installation, mais il est **volontairement incomplet** :
les fonctionnalités métier listées plus bas sont à développer.

- Frontend : React, TypeScript, Vite (`frontend/`)
- Backend : Node.js, Express, TypeScript (`backend/`)
- Base de données : SQLite, fichier local créé automatiquement (`backend/data/gesta.db`)

## Prérequis

- Node.js 22.14 ou plus récent, avec npm : Node 24 LTS recommandé ; Node 22 et 26
  conviennent aussi. Si une autre version est déjà installée, essayez d'abord : le projet
  vous préviendra clairement si une mise à jour est nécessaire.
- Git
- Recommandé : Visual Studio Code avec l'extension REST Client, pour les fichiers `backend/http/*.http`

Aucun autre outil n'est nécessaire : ni Python, ni Visual Studio, ni compilateur. En
installant Node.js sous Windows, **ne cochez pas** la case qui propose d'installer les
« outils pour les modules natifs » (Chocolatey, Python, Visual Studio Build Tools) : elle
est inutile pour ce projet et télécharge plusieurs gigaoctets.

## Démarrage

À la racine du dépôt :

```bash
npm ci
npm run setup
npm run dev
```

- `npm ci` installe exactement les versions enregistrées dans `package-lock.json`, sans le
  modifier. Utilisez `npm install <paquet>` seulement pour ajouter une dépendance.
- Le fichier `.npmrc` empêche les dépendances d'exécuter des scripts à l'installation
  (`ignore-scripts=true`). Sans lui, npm tenterait de compiler better-sqlite3, ce qui
  exigerait Python et Visual Studio, alors que le paquet contient déjà ses versions
  précompilées pour Windows, macOS et Linux.
- `npm run setup` crée `backend/.env` (avec une clé de signature aléatoire) puis la base de
  données avec les données de démonstration. Il suffit de le lancer une fois.
- `npm run dev` démarre l'API sur http://localhost:3000 et l'application sur
  **http://localhost:5173**.

Choisissez ensuite un utilisateur fictif sur l'écran de connexion (voir « Mode démo »).

## Commandes

Toutes les commandes se lancent à la racine.

| Commande | Rôle |
|---|---|
| `npm run dev` | Démarre le backend et le frontend |
| `npm run setup` | Crée `backend/.env` s'il n'existe pas, puis initialise la base |
| `npm run db:init` | Crée la base et applique les migrations ; insère les données de démo si elle est vide |
| `npm run db:reset` | Supprime la base et la recrée avec les données de démo (arrêter `npm run dev` avant) |
| `npm run lint` | Oxlint, sans erreur ni avertissement toléré |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests automatisés (Vitest) |
| `npm run build` | Compilation du backend et du frontend |
| `npm run check` | Lint, typecheck, tests et build : à lancer avant chaque commit important |

## Documentation

| Document | Contenu |
|---|---|
| [docs/cdc_gesta_developpement.md](docs/cdc_gesta_developpement.md) | Cahier des charges métier de Gesta |
| [docs/architecture.md](docs/architecture.md) | Organisation du code et parcours existants |
| [docs/seed.md](docs/seed.md) | Données de démonstration et utilisateurs fictifs |
| [backend/API.md](backend/API.md) | Routes de l'API, réponses et erreurs |

## Choix techniques

Les outils ont été choisis pour rester simples et lisibles :

| Choix | Pourquoi |
|---|---|
| SQLite avec `better-sqlite3` et SQL écrit à la main | Aucun serveur de base à installer (binaires précompilés, rien à compiler) ; requêtes visibles dans les repositories, sans ORM à apprendre |
| Migrations en fichiers `.sql` | Le schéma se lit directement ; une évolution est un nouveau fichier |
| Validation par type guards écrits à la main | Pratique du cours, sans bibliothèque supplémentaire |
| React Router, CSS simple | Pas de bibliothèque d'interface : moins de code et de contexte à explorer |
| Oxlint | Linter rapide, configuré pour les règles essentielles de React et TypeScript (hooks, dépendances des effets, `any`) |
| npm workspaces | Une installation et des commandes communes, sans outil de monorepo |
| Vitest, Supertest, Testing Library | Les mêmes outils pour le backend et le frontend |

## Ce qui est déjà en place

- Connexion de démonstration, navigation adaptée au profil, déconnexion.
- **Entreprises** : liste et recherche par nom (`GET /companies`). Un administrateur voit
  toutes les entreprises ; les autres utilisateurs, seulement les entreprises actives.
- **Offres** : liste en lecture seule (`GET /offers`), filtrée selon le profil :
  - l'administrateur voit toutes les offres ;
  - l'étudiant voit les offres publiées ;
  - le déposant voit les offres qu'il a déposées ;
  - un contact sans rôle de déposant n'y a pas accès (403).
- Schéma complet de la base : entreprises, contacts et rôles, étudiants, administrateurs,
  années et périodes, offres, candidatures et stages.
- Identification et contrôle des droits côté serveur, tests automatisés.

## Ce qui n'est pas implémenté

Ces fonctionnalités du cahier des charges n'existent pas encore, ni dans l'API ni dans
l'interface :

- création d'une offre par un déposant, modification ou retrait ;
- recherche et filtrage des offres (année, période, statut…) ;
- validation, mise en attente, publication ou archivage d'une offre par un administrateur ;
- candidature d'un étudiant et retrait d'une candidature ;
- sélection d'un candidat et création du stage ;
- déclaration d'un stage par un étudiant et validation par un administrateur ;
- gestion des entreprises, des contacts et de leurs rôles, détection et fusion des doublons ;
- conventions, exports Excel, gestion des années académiques ;
- connexion réelle par lien envoyé par e-mail.

## Mode démo

La connexion réelle (lien à usage unique envoyé par e-mail) n'est pas implémentée. Elle est
remplacée par un **mode démo** : on choisit un utilisateur fictif, **sans mot de passe**.

- Ce n'est **pas** une authentification : n'importe qui peut se connecter sous n'importe
  quelle identité. Ce mode est réservé au développement local.
- Il est activé par `DEMO_AUTH_ENABLED=true` dans `backend/.env`. Le serveur refuse de
  démarrer si ce mode est activé avec `NODE_ENV=production`.
- Le jeton de session ne contient que l'identité. Les rôles et les entreprises de
  l'utilisateur sont relus en base à chaque requête : le frontend ne peut pas les modifier.
- Seuls les comptes actifs apparaissent ; un contact doit avoir au moins un rôle.

## Dépannage

**« JWT_SECRET absent ou trop court »** : lancez `npm run setup`.

**« Node … est trop ancien pour ce projet »** au démarrage : mettez Node à jour (Node 24 LTS,
ou au minimum 22.14). Pour un Node 22 déjà installé, il suffit d'installer la dernière
version 22 par-dessus.

**Avertissement `EBADENGINE` pendant `npm ci`** : sans conséquence si l'installation se
termine. Certaines dépendances déclarent ne pas soutenir officiellement votre version de
Node (par exemple 23 ou 25) ; le projet fonctionne quand même.

**Une nouvelle dépendance ne fonctionne pas après son installation** : à cause de
`ignore-scripts=true` (voir « Démarrage »), ses scripts d'installation n'ont pas été
exécutés. C'est rare ; sa documentation indique alors la commande à lancer à la main.

**« Cannot find native binding » ou « @esbuild/… could not be found »** : un bug connu de
npm ([npm/cli#4828](https://github.com/npm/cli/issues/4828)) retire parfois des binaires
natifs de `package-lock.json` lors d'un `npm install`.

- Si vous n'avez pas ajouté de dépendance, restaurez le lockfile de Git et réinstallez :

  ```bash
  git checkout -- package-lock.json
  npm ci
  ```

- Si vous venez d'ajouter une dépendance, régénérez le lockfile :

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

  Sous Windows (PowerShell) :

  ```powershell
  Remove-Item -Recurse -Force node_modules, package-lock.json
  npm install
  ```

Après avoir ajouté une dépendance, vérifiez que `package-lock.json` contient toujours
`@esbuild/win32-x64` et `@rolldown/binding-win32-x64-msvc` : sinon, l'installation échouera
chez les membres du groupe qui travaillent sous Windows.

**`npm run db:reset` échoue sous Windows** : arrêtez d'abord `npm run dev`, qui garde la
base ouverte.

**Port 5173 ou 3000 déjà utilisé** : un autre `npm run dev` tourne sans doute déjà. Le port
de l'API se change avec `API_PORT` dans `backend/.env`.

## Suivi des séances

Après chaque séance, ajoutez dans `docs/` la conversation exportée avec l'agent
(`conversation-1.md`, `conversation-2.md`…). En fin de projet, ajoutez `docs/bilan.md`.
