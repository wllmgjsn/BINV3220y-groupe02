# Conversation 1

Transcription des échanges autour du projet Gesta — 20 octobre 2026.

---

## 1. Salutations

**Utilisateur**

> Bonjour

**Assistant**

Bonjour ! Comment puis-je vous aider ?

---

## 2. Instructions Copilot du dépôt

**Utilisateur**

> Analyze this codebase and create a .github/copilot-instructions.md file to help future Copilot sessions work effectively in this repository.
>
> Include build, test, and lint commands, high-level architecture, and codebase-specific conventions. Incorporate the README and other relevant instructions. After creating the file, ask whether MCP servers relevant to the project should be configured, and finish with a summary.

**Assistant**

J’ai créé [.github/copilot-instructions.md](../../.github/copilot-instructions.md) avec les consignes propres au dépôt : installation et commandes, architecture du backend et du frontend, commandes de tests ciblés et conventions importantes du projet.

Souhaitez-vous ajuster le document ou ajouter des consignes pour un domaine particulier ?

**Assistant**

Souhaitez-vous configurer un serveur MCP pertinent pour ce projet ?

**Utilisateur**

> No, not needed.

---

## 3. Analyse d’une image

**Utilisateur**

> [Image jointe]

**Assistant**

Je ne vois pas de contenu exploitable dans l’image partagée : elle semble entièrement noire ou vide, donc je ne peux pas l’analyser utilement.

Vous pouvez envoyer une capture plus claire ou décrire ce que vous souhaitez que je regarde.

---

## 4. Documentation d’architecture

**Utilisateur**

> Inspecte le code de ce projet. Crée un répertoire ./docs dans lequel tu vas placer une description de l'architecture de ce projet.

**Assistant**

Le répertoire [docs](..) existait déjà. J’ai complété [architecture.md](../architecture.md) pour décrire l’organisation du backend et du frontend, le flux d’authentification et de permissions, la base SQLite, les tests et les parcours de référence.

---

## 5. Workflow de visualisation d’une offre

**Utilisateur**

> Génère moi une page html dans ./docs décrivant le workflow de la visualisation d’une offre depuis le front jusqu’au back et retour.

**Assistant**

J’ai créé [offer-visualization-workflow.html](../offer-visualization-workflow.html). La page décrit le parcours de bout en bout : chargement depuis la page frontend, appel HTTP, authentification et autorisation backend, filtrage métier, requête SQL, sérialisation de la réponse puis affichage des offres.

---

## 6. Rôle du backend

**Utilisateur**

> Quel est le rôle du backend dans ce projet ?

**Assistant**

Le backend est la partie serveur de Gesta. Il expose une API REST avec Express, reçoit les requêtes du frontend et renvoie des réponses JSON. Il gère l’accès à SQLite, applique les règles métier et les permissions, vérifie les jetons de session et traite les erreurs.

Pour les offres, les requêtes passent par les couches contrôleur, service et repository. Le point d’assemblage de l’application Express est [backend/src/app.ts](../../backend/src/app.ts).

---

## 7. Utilisation d’un ORM

**Utilisateur**

> Est-ce qu'on utilise un ORM dans le backend ici ?

**Assistant**

Non. Le backend accède à SQLite avec `better-sqlite3` et utilise du SQL écrit à la main dans les repositories. [database.ts](../../backend/src/db/database.ts) ouvre la connexion ; les requêtes sont notamment dans [offers.repository.ts](../../backend/src/repositories/offers.repository.ts).

---

## 8. Comparaison avec les PreparedStatement Java

**Utilisateur**

> Est-ce que cette partie de code est comparable aux PreparedStatements en Java ?

**Assistant**

Oui. `db.prepare(...)` prépare une requête SQL, puis `findAll.all(...)` l’exécute en liant séparément les paramètres nommés, comme un `PreparedStatement` JDBC avec `setString`/`setInt` puis `executeQuery`.

`escapeLike` complète ce mécanisme en faisant traiter `%` et `_` comme des caractères littéraux dans la recherche `LIKE`.

---

## 9. Protection contre l’injection SQL

**Utilisateur**

> Est-ce que le db.prepare empêche une potentielle injection SQL ?

**Assistant**

Dans ce code, les paramètres liés à la requête préparée protègent contre l’injection SQL : `@pattern` et `@activeOnly` sont fournis séparément et traités comme des valeurs.

`db.prepare()` ne protège pas si du texte utilisateur est concaténé dans la chaîne SQL. Ici, le SQL est fixe. `escapeLike` traite les jokers `%` et `_` pour la recherche ; ce n’est pas lui qui assure la protection contre l’injection.

---

## 10. Utilité de l’application

**Utilisateur**

> À quoi sert concrètement cette application ?

**Assistant**

Gesta est conçue pour gérer les stages étudiants et relier étudiants, contacts d’entreprise et administrateurs. Pour le moment, le projet est incomplet : il permet une connexion de démonstration, la consultation des entreprises et la liste des offres filtrée selon le profil. Les candidatures, la gestion complète des stages et plusieurs fonctions d’administration restent à développer.

---

## 11. Fonctions d’administration

**Utilisateur**

> Quelles sont les fonctions d'administration existantes et celles à développer ?

**Assistant**

Les fonctions d’administration existantes sont principalement consultatives :

- Connexion avec un profil administrateur en mode démo.
- Consultation de toutes les entreprises, y compris celles qui ne sont pas actives.
- Consultation de toutes les offres, quel que soit leur statut.

Les fonctions à développer comprennent notamment la modération des offres, la validation des déclarations de stage, la gestion des entreprises, contacts et rôles, la fusion de doublons et la gestion des années académiques. Les offres et entreprises sont actuellement affichées en lecture seule.

---

## 12. Filtre de période des offres

**Utilisateur**

> Ajoutez un filtre à la page des offres avec les choix suivants :
>
> - Toutes les périodes ;
> - P1 ;
> - P2 ;
> - Autre.
>
> Le filtre doit être transmis à l’API, par exemple avec `GET /offers?period=P1`.
>
> Le filtre est facultatif ; sans filtre, les offres visibles normalement restent affichées ; les permissions par profil ne changent pas ; aucune dépendance ni migration n’est nécessaire ; ajoutez ou adaptez les tests backend et frontend.

**Assistant**

Le filtre est ajouté à la page des offres et transmis à l’API sous la forme `GET /offers?period=P1` (ou `P2`, `OTHER`). « Toutes les périodes » n’ajoute pas de paramètre. Le backend valide le paramètre et le combine aux règles de visibilité existantes.

Les tests ciblés backend (15 tests) et frontend (5 tests), `npm run typecheck` et `npm run lint` ont réussi. Aucune dépendance ni migration n’a été ajoutée.

---

## 13. Offres P1 dans la base locale

**Utilisateur**

> Ajoute plusieurs offres en période P1 dans la DB

**Assistant**

J’ai ajouté et vérifié trois offres publiées en P1 de l’année 2026-2027 dans la base locale [backend/data/gesta.db](../../backend/data/gesta.db) :

- Cobalt — Développement d’un outil de suivi énergétique
- Vertigo — Amélioration de la plateforme de réservation
- Pixelune — Automatisation de l’analyse de données

Attention : `npm run db:reset` recrée la base depuis les données de démonstration et supprimera ces ajouts.

---

## 14. Synchronisation du filtre avec l’URL

**Utilisateur**

> Sauf erreur de ma part, tu gères le filtrage avec un état dans le composant de la page des offres. Cela ne permet pas de modifier l'url dynamiquement avec les nouveaux paramètres de query, refactor le code pour que le changement de filtre passe par l'URL.

**Assistant**

Le filtre est maintenant piloté par les paramètres de recherche de React Router dans [OffersPage.tsx](../../frontend/src/pages/OffersPage.tsx). Choisir une période met à jour l’URL (`?period=P1`, par exemple) et le filtre est initialisé depuis l’URL. Les autres paramètres de recherche sont conservés ; « Toutes les périodes » retire uniquement `period`.

Les tests de [OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx) vérifient la synchronisation URL/API. Les 6 tests ciblés, le typecheck et le lint du frontend ont réussi.
