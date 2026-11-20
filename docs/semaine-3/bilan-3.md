# Observations


## Matrice des guides et des senseurs

| Case | Mécanisme (fichier) | Ce qu'il demande / vérifie | Exemple concret | Exécuté pendant la séance ? |
|---|---|---|---|---|
| Guide · inférentiel | Instructions Copilot (`.github/copilot-instructions.md`) | Conventions et commandes que l'agent doit suivre | Utiliser `npm run db:reset` plutôt que supprimer la base ; préférer la plus petite commande pertinente | Non exécutable : lu et vérifié |
| Guide · inférentiel | Cahier des charges (`docs/cdc_gesta_developpement.md`) | Exigences fonctionnelles et règles métier | EF-32 : candidater à une offre publiée, retirer tant que « En cours » | Non exécutable : lu et vérifié |
| Guide · inférentiel | Architecture, API et données (`docs/architecture.md`, `backend/API.md`, `docs/seed.md`) | Organisation du code, routes, données de démonstration | Découpage controllers / services / repositories | Non exécutable : lu et vérifié |
| Guide · computationnel | Aucun identifié | — | — | — |
| Senseur · inférentiel | Aucun identifié | Le template de PR (`.github/pull_request_template.md`) est une checklist pour humains, pas une revue par IA | — | — |
| Senseur · computationnel | Tests Vitest (`backend/tests`, `frontend/tests`) | Comportement de l'API et de l'interface | `refuse une candidature à une offre non publiée` → `409 OFFER_NOT_PUBLISHED` | Oui : `npm run check` du 14/11 — backend 126/126, frontend 52/52 |
| Senseur · computationnel | Lint Oxlint (`.oxlintrc.json`, `--deny-warnings`) | Règles de qualité du code | `typescript/no-explicit-any` et `eqeqeq` en erreur | Oui : 0 avertissement, 0 erreur (backend et frontend) |
| Senseur · computationnel | TypeScript (`tsc --noEmit`) et build | Cohérence des types, compilation | Erreur si un type ne correspond pas | Oui : typecheck sans erreur, build réussi |

Les quatre contrôles computationnels sont regroupés dans `npm run check` (`package.json` racine).

Exemple de règle : le cahier des charges définit le périmètre du projet. Il définis les besoins du projet à l'agent.

Exemple de résultat : npm run check lance les tests automatisés et vérifie la cohérence des résultats renvoyés par le code. Le checking a été exécuté et vérifié pendant la séance.

## Matrice de traçabilité — exigences travaillées en semaine 2

| Exigence | Comportement attendu | Tests backend qui le vérifient | Tests frontend qui le vérifient | Couverture réelle |
|---|---|---|---|---|
| **EF-32 — Candidater** | Un étudiant peut candidater à une offre publiée, avec un message facultatif. | `backend/tests/applications.test.ts` : « crée une candidature sans message pour une offre publiée », « nettoie le message facultatif », « refuse un message qui n'est pas un texte », « refuse une candidature à une offre non publiée ». | `frontend/tests/OffersPage.test.tsx` : « permet à un étudiant de candidater avec un message facultatif » vérifie l'envoi de la requête POST et de son contenu. | Le parcours métier et les validations sont vérifiés côté API. Le test UI vérifie l'envoi, pas l'affichage du résultat de candidature. |
| **EF-32 — Retirer / recandidater** | Retrait seulement tant que la candidature est « En cours » ; une nouvelle candidature est possible après retrait. | `backend/tests/applications.test.ts` : « permet de retirer une candidature en cours puis de candidater à nouveau », « ne permet pas de retirer la candidature d'un autre étudiant », « interdit de retirer une candidature déjà traitée », « refuse une deuxième candidature tant que la précédente n'est pas retirée ». `backend/tests/db/constraints.test.ts` : « limite à une candidature non retirée par étudiant et par offre ». | `frontend/tests/ApplicationsPage.test.tsx` : « affiche les statuts et permet de retirer une candidature en cours » vérifie l'envoi du PATCH. | Les règles d'autorisation, de statut et d'unicité sont exercées côté API/base ; le test UI vérifie le déclenchement de l'action, pas son résultat visuel après réponse. |
| **EF-33 — Consulter ses candidatures et statuts** | Un étudiant voit ses propres candidatures et leurs statuts : « En cours », « Retenue », « Non retenue » ou « Retirée ». | `backend/tests/applications.test.ts` : « ne retourne que les candidatures de l'étudiant connecté » vérifie le filtrage par étudiant et une candidature « IN_PROGRESS ». | `frontend/tests/ApplicationsPage.test.tsx` : « affiche les statuts et permet de retirer une candidature en cours » vérifie les libellés « En cours », « Retenue » et « Retirée ». | **Partielle :** le test frontend ne vérifie pas le libellé « Non retenue » ; le test backend de liste ne vérifie pas les quatre statuts. |
| **Affichage des candidatures retirées** (amélioration décidée en semaine 2) | Les candidatures retirées sont masquées par défaut et visibles à la demande. | Aucun test backend spécifique : le filtrage est une règle d'affichage frontend. | `frontend/tests/ApplicationsPage.test.tsx` : « affiche les statuts et permet de retirer une candidature en cours » vérifie le masquage puis l'affichage au clic ; « permet d'afficher les candidatures retirées quand aucune autre candidature n'existe » vérifie l'état vide et leur affichage. | Couvert côté interface, y compris le cas où seules des candidatures retirées existent. |

### Détail de traçabilité par cas de test

| Exigence | Cas à vérifier | Test existant (fichier + nom) | Assertions utiles | Couverture (partiel/absent) |
|---|---|---|---|---|
| **EF-32 — Candidater** | Candidater à une offre publiée sans message | [applications.test.ts](../../backend/tests/applications.test.ts) — `crée une candidature sans message pour une offre publiée` | Réponse `201`, `message: null`, statut `IN_PROGRESS` | Complet pour ce cas |
| **EF-32 — Candidater** | Candidater avec un message facultatif depuis l'interface | [OffersPage.test.tsx](../../frontend/tests/OffersPage.test.tsx) — `permet à un étudiant de candidater avec un message facultatif` | La requête `POST /api/applications` contient l'identifiant de l'offre et le message | Partiel : vérifie l'envoi UI, pas le résultat affiché |
| **EF-32 — Message** | Nettoyer les espaces du message soumis | [applications.test.ts](../../backend/tests/applications.test.ts) — `nettoie le message facultatif` | Le message retourné est sans espaces superflus | Complet pour le nettoyage |
| **EF-32 — Message** | Refuser un message d'un type invalide | [applications.test.ts](../../backend/tests/applications.test.ts) — `refuse un message qui n'est pas un texte` | Réponse `400`, code `INVALID_MESSAGE` | Complet pour ce cas |
| **EF-32 — Candidater** | Refuser une offre qui n'est pas publiée | [applications.test.ts](../../backend/tests/applications.test.ts) — `refuse une candidature à une offre non publiée` | Réponse `409`, code `OFFER_NOT_PUBLISHED` | Complet pour ce cas |
| **EF-32 — Candidater** | Refuser une deuxième candidature active au même étudiant et à la même offre | [applications.test.ts](../../backend/tests/applications.test.ts) — `refuse une deuxième candidature tant que la précédente n'est pas retirée` ; [constraints.test.ts](../../backend/tests/db/constraints.test.ts) — `limite à une candidature non retirée par étudiant et par offre` | Réponse `409` côté API ; violation d'unicité en base | Complet pour l'unicité par offre |
| **EF-32 — Retirer** | Retirer une candidature en cours, puis candidater à nouveau à cette offre | [applications.test.ts](../../backend/tests/applications.test.ts) — `permet de retirer une candidature en cours puis de candidater à nouveau` | Retrait `204`, nouvelle candidature `201` | Complet pour ce parcours |
| **EF-32 — Retirer** | Empêcher le retrait de la candidature d'un autre étudiant | [applications.test.ts](../../backend/tests/applications.test.ts) — `ne permet pas de retirer la candidature d'un autre étudiant` | Réponse `404`, code `APPLICATION_NOT_FOUND` | Complet pour ce cas |
| **EF-32 — Retirer** | Empêcher le retrait d'une candidature déjà traitée | [applications.test.ts](../../backend/tests/applications.test.ts) — `interdit de retirer une candidature déjà traitée`, `ne permet pas à un étudiant de retirer une candidature rejetée` | Réponse `409`, code `APPLICATION_ALREADY_PROCESSED` pour une candidature retenue ou rejetée | Couvert |
| **EF-32 — Autorisations** | Empêcher un non-étudiant de déposer ou retirer une candidature | [applications.test.ts](../../backend/tests/applications.test.ts) — `réserve la création d'une candidature à l'étudiant`, `réserve le retrait d'une candidature à l'étudiant` | Réponse `403`, code `FORBIDDEN` pour les routes `POST` et `PATCH` avec un administrateur | Couvert |
| **EF-33 — Consulter** | Exiger une session pour consulter ses candidatures | [applications.test.ts](../../backend/tests/applications.test.ts) — `exige une session` | Réponse `401` | Complet pour ce cas |
| **EF-33 — Consulter** | Réserver la consultation aux étudiants | [applications.test.ts](../../backend/tests/applications.test.ts) — `réserve la consultation des candidatures à l'étudiant` | Administrateur refusé avec `403 FORBIDDEN` | Partiel : couvre un administrateur, pas tous les profils non étudiants |
| **EF-33 — Consulter** | Ne retourner que les candidatures de l'étudiant connecté | [applications.test.ts](../../backend/tests/applications.test.ts) — `ne retourne que les candidatures de l'étudiant connecté` | Réponse `200` contenant la candidature de l'étudiant connecté | Complet pour le cas testé |
| **EF-33 — Statuts** | Afficher les statuts « En cours », « Retenue », « Non retenue » et « Retirée » | [ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) — `affiche les statuts et permet de retirer une candidature en cours` ; [applications.test.ts](../../backend/tests/applications.test.ts) — `ne retourne que les candidatures de l'étudiant connecté` | Le test UI vérifie « En cours », « Retenue » et « Retirée » ; le test API vérifie une candidature `IN_PROGRESS` | Partiel : l'affichage « Non retenue » et la réponse API avec les quatre statuts ne sont pas vérifiés |
| **EF-33 — Retirées** | Masquer les candidatures retirées par défaut, puis les afficher à la demande | [ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) — `affiche les statuts et permet de retirer une candidature en cours` | La candidature retirée est absente avant le clic, visible après | Complet pour ce cas UI |
| **EF-33 — Retirées** | Permettre l'affichage des candidatures retirées lorsqu'elles sont les seules | [ApplicationsPage.test.tsx](../../frontend/tests/ApplicationsPage.test.tsx) — `permet d'afficher les candidatures retirées quand aucune autre candidature n'existe` | État vide initial, puis candidature visible après activation de la case | Complet pour ce cas UI |
| **EF-33 — Navigation** | Proposer « Mes candidatures » à l'étudiant uniquement | [NavBar.test.tsx](../../frontend/tests/NavBar.test.tsx) — `propose les candidatures à l'étudiant uniquement` | Le lien est visible pour l'étudiant | Partiel : vérifie la présence, pas l'absence pour chaque autre profil |
| **Données liées aux statuts** | Vérifier que le jeu de démonstration contient tous les statuts et reste cohérent avec le stage attribué | [seed.test.ts](../../backend/tests/db/seed.test.ts) — `couvre tous les statuts de candidature et une offre à plusieurs candidats`, `le stage issu d'une offre correspond à l'offre attribuée et à la candidature retenue`, `une offre attribuée a toujours un stage et une offre a au plus une candidature retenue` | Présence des quatre statuts ; cohérence de la candidature retenue, du stage et de l'offre attribuée | Partiel : valide les données de démonstration, pas tout le comportement fonctionnel |

## Cas absents ou partiellement couverts

### Couverture partielle

- **Statuts des candidatures (EF-33)** : l'interface vérifie « En cours », « Retenue » et « Retirée », mais pas « Non retenue ». Le test de liste API ne vérifie pas les quatre statuts dans une même réponse.
- **Accès à la consultation (EF-33)** : le refus est testé pour un administrateur, mais pas pour tous les profils non étudiants.

### Cas absents

- **Plusieurs offres retenues pour le même étudiant** : aucun test ne vérifie si un étudiant peut être retenu sur plusieurs offres distinctes. Ce comportement n'est pas défini par EF-32 ou EF-33 et reste à clarifier séparément.

## Modifications et vérification

### Tests ajoutés pour EF-32

| Nom du test | Cas couvert (EF-32) | Assertions | Défaut qui le ferait échouer |
|---|---|---|---|
| `réserve la création d'une candidature à l'étudiant` | Un administrateur tente de créer une candidature avec `POST /applications` | Statut HTTP `403` et code `FORBIDDEN` | Une règle d'autorisation absente ou incorrecte laisserait un administrateur créer une candidature. |
| `réserve le retrait d'une candidature à l'étudiant` | Un administrateur tente de retirer une candidature en cours avec `PATCH /applications/:id/withdraw` | Statut HTTP `403` et code `FORBIDDEN` | Une règle d'autorisation absente ou incorrecte laisserait un administrateur retirer une candidature. |
| `ne permet pas à un étudiant de retirer une candidature rejetée` | Un étudiant tente de retirer une candidature au statut `REJECTED` (« Non retenue ») | Statut HTTP `409` et code `APPLICATION_ALREADY_PROCESSED` | Le service autoriserait le retrait d'une candidature déjà traitée au lieu de la refuser. |

### Commandes et résultats

| Commande | Résultat |
|---|---|
| `npm run check` (avant les tests EF-32) | Réussi : backend `126/126`, frontend `52/52`. Lint et typecheck sans erreur ; build réussi. |
| `npm test -w backend -- tests/applications.test.ts` | Réussi : `14/14` tests. |
| `npm run check` (après les tests EF-32) | Réussi : backend `129/129`, frontend `52/52`. Lint et typecheck sans erreur ; build réussi. |

### Limites restantes

- L'affichage « Non retenue » côté frontend n'est toujours pas couvert.
- La liste API avec les quatre statuts n'est toujours pas vérifiée dans une même réponse.
- Le cas de plusieurs offres retenues pour un même étudiant n'est toujours pas couvert.

### Vérifications manuelles

- Diff relu : seul `backend/tests/applications.test.ts` a été modifié, aucun fichier de `src/`.
- Chaque test ajouté vérifie le statut HTTP et le code d'erreur.
- Le test sur la candidature rejetée renvoie `409` et non `404`, ce qui confirme que la candidature de démonstration appartient bien à l'étudiante et qu'elle est déjà traitée.
- Les passages cités dans l'audit ont été retrouvés dans les guides.

## Audit des guides

| Attente (source Web 2) | Guide examiné (fichier + passage cité exactement) | Correspondance (Oui / Partielle / Non / Contradiction) | Écart ou ajout proposé |
|---|---|---|---|
| Conventions REST et codes de retour HTTP `400`, `401`, `403`, `404`, `409` (Séance 02, slides « Conventions REST » et « Codes de retour HTTP ») | `.github/copilot-instructions.md` : « `backend/src/controllers/` handles route-level validation and HTTP responses. » ; « `HttpError` is the standard way to report domain errors; central middleware turns it into a JSON `{ error: { code, message } }` response. » | Partielle | Le guide impose la validation, les réponses HTTP et le format d'erreur, mais n'énumère pas les codes attendus ni leur usage par situation. Ajouter une table courte reliant les erreurs de validation, d'authentification, d'autorisation, de ressource absente et de conflit aux codes `400` à `409`. |
| Documenter l'API dans un document Markdown et la tester avec REST Client (Séance 02, slides « Documentation API : Document Markdown » et « Tests d'API ») | `docs/architecture.md` : « `backend/` : API REST, logique métier, accès SQLite et règles d'autorisation » ; « `backend/API.md` : documentation des routes » ; « `backend/http/` : requêtes REST Client » (dans l'arborescence). | Partielle | Les deux supports attendus sont explicitement identifiés. Préciser éventuellement dans le guide que toute nouvelle route doit être ajoutée à `backend/API.md` et accompagnée d'une requête dans `backend/http/`. |
| Routage côté client avec React Router : routes, layout commun avec `Outlet`, route index et page 404 (Séance 15, slides « React Router », « Un layout commun : routes imbriquées », « Route index et page 404 ») | `.github/copilot-instructions.md` : « `App.tsx` calls `useAuth()` once and passes session state down through routes. » ; `docs/architecture.md` : « `frontend/src/App.tsx` : session utilisateur et navigation ». | Partielle | Le routage et `App.tsx` sont mentionnés, mais les guides ne prescrivent ni `Outlet`, ni route index, ni route 404. Ajouter ces invariants de structure aux indications frontend si ces éléments sont requis par le cours. |
| Valider les données reçues avec des type guards, sous la forme `obj is Type`, en vérifiant entièrement les propriétés (Séance 01, slides « Type guard ») | `.github/copilot-instructions.md` : « `frontend/src/services/` wraps HTTP calls and performs JSON validation with type guards. » ; « `frontend/src/utils/` contains shared display logic, permission helpers, token storage, and type guards. » | Partielle | Le recours aux type guards et leur emplacement sont indiqués, mais pas la signature `obj is Type` ni l'obligation de vérifier toutes les propriétés. Ajouter un exemple de garde complète et rappeler que les réponses JSON ne doivent pas être considérées comme valides sur un simple cast. |

### Recommandations

1. Compléter `.github/copilot-instructions.md` avec une table des codes HTTP et des exemples de correspondance avec `HttpError`, afin d'éviter des réponses incohérentes entre contrôleurs.
2. Ajouter aux guides frontend une structure React Router explicite (`Outlet`, route index et page 404), car la mention générale des routes ne suffit pas à vérifier ces attentes du cours.
3. Formaliser le contrat des type guards (`obj is Type` et vérification de chaque propriété) et exiger la mise à jour conjointe de `backend/API.md` et de `backend/http/` pour chaque nouvelle route.
