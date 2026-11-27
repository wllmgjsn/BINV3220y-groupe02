# Semaine 5 : bilan

## Pourcentage d'utilisation de la capacité totale de Copilot au début du projet : 9%

## Commande pour lancer playwright :
npx -y @playwright/mcp@latest --isolated --port 8931

## Avant de commencer
Nous avons ajusté le frontend afin qu'on puisse utiliser un bouton de retrait d'offre en tant qu'administrateur ou déposant tant qu'une offre n'est pas publiée. En effet il doit être possible de pouvoir faire des test e2e avec le retrait.

## Scénarios

Les scénarios sont décrits ici : [tests/e2e/recherche-offres/scenarios.md](../../tests/e2e/recherche-offres/scenarios.md)

1. Consulter ses candidatures avec une session valide (étudiant Louis Claes)
2. Afficher une erreur lors d'un échec de retrait dans l'interface (déposant Julien Lambert)

**Pourquoi ces deux cas ?**
- On voulait un cas « normal » et un cas d'erreur. Le scénario 1 vérifie le parcours de base d'un étudiant : il se connecte, va sur « Mes candidatures » et retrouve bien ses candidatures (y compris les retirées quand on coche la case). C'est une des pages les plus utilisées par les étudiants, donc si elle casse on veut le savoir tout de suite.
- Le scénario 2 teste une règle métier du cahier des charges : une offre liée à un stage ne peut pas être supprimée. Ici ce n'est pas juste l'interface qui est testée, il faut que le backend refuse vraiment et que le frontend affiche le message d'erreur sans faire disparaître l'offre. C'est typiquement le genre de chose qui ne se voit pas avec des tests unitaires séparés frontend/backend.
- Les deux scénarios utilisent aussi deux rôles différents (étudiant et contact déposant), ce qui fait passer par deux chemins de connexion et de permissions différents.

## MCP

**Scénario exécuté : scénario 2** (échec du retrait de l'offre « Offre de test non retirable »).

**Résultat : réussi.** Le comportement observé correspond à ce qui est attendu : le message d'erreur s'affiche et l'offre reste dans la liste.

Appels d'outils observés et ce qu'ils ont renvoyé :

| Outil MCP | Ce que l'agent a fait | Ce qui a été renvoyé |
|---|---|---|
| `browser_navigate` | Ouvre l'application (frontend local) | Le snapshot de la page d'accueil avec les boutons de connexion des utilisateurs de démo |
| `browser_click` | Clique sur « Julien Lambert » puis sur l'onglet « Offres » | La page « Offres » avec le tableau des offres, dont la ligne « Offre de test non retirable » au statut « Soumise » |
| `browser_click` | Clique sur « Retirer l'offre Offre de test non retirable » | Une fenêtre de confirmation (dialog `confirm`) en attente |
| `browser_handle_dialog` | Accepte la confirmation | La fenêtre est fermée, la requête de retrait est envoyée à l'API |
| `browser_snapshot` | Relit la page | Une alerte avec le texte « Cette offre est liée à un stage et ne peut pas être supprimée » et la ligne de l'offre toujours présente dans le tableau |

## Playwright Test

**Fichiers créés :**
- [playwright.config.ts](../../playwright.config.ts) : config (dossier `tests/e2e/recherche-offres`, Chromium + Firefox + WebKit, lancement automatique du backend sur le port 4317 avec une base SQLite temporaire et du frontend sur le port 5174)
- [tests/e2e/recherche-offres/prepare-db.ts](../../tests/e2e/recherche-offres/prepare-db.ts) : crée la base E2E (migrations + seed) et ajoute deux candidatures pour Louis Claes (une en cours, une retirée)
- [tests/e2e/recherche-offres/recherche-offres.spec.ts](../../tests/e2e/recherche-offres/recherche-offres.spec.ts) : les deux tests
- [tests/e2e/recherche-offres/scenarios.md](../../tests/e2e/recherche-offres/scenarios.md) : la description des scénarios
- `@playwright/test` ajouté en devDependency dans le `package.json` racine

**Principales assertions :**
- Scénario 1 :
  - le titre « Mes candidatures » est visible (`toBeVisible`)
  - la ligne « Assistant conversationnel interne » contient « En cours » (`toContainText`)
  - après avoir coché « Afficher les candidatures retirées », la ligne « Tableau de bord de qualité des données » contient « Retirée »
- Scénario 2 :
  - la ligne « Offre de test non retirable » contient « Soumise »
  - la fenêtre qui s'ouvre est bien de type `confirm`
  - l'alerte affiche exactement « Cette offre est liée à un stage et ne peut pas être supprimée » (`toHaveText`)
  - l'offre est toujours visible après l'échec (`toBeVisible`)

**Deux exécutions successives (`npx playwright test`) :**

| Exécution | Résultat |
|---|---|
| 1 | 6 passed (13.8s) : 2 tests × 3 navigateurs |
| 2 | 6 passed (13.3s) |

Comme la base est recréée à chaque lancement, la deuxième exécution donne le même résultat que la première (le test ne dépend pas de ce qu'a laissé le précédent).

**`npm run check` :** réussi (code de sortie 0). Lint et typecheck OK, 139 tests backend (10 fichiers) et 56 tests frontend (8 fichiers) passés, build OK.

## Vérification

Pour être sûr que le test détecte vraiment un problème, on a introduit un défaut temporaire.

- **Défaut introduit :** dans [backend/src/services/offers.service.ts](../../backend/src/services/offers.service.ts), on a remplacé le message d'erreur « Cette offre est liée à un stage et ne peut pas être supprimée » par « Impossible de retirer cette offre ».
- **Échec constaté :** `3 failed, 3 passed`. Le scénario 2 échoue sur les trois navigateurs :
  ```
  Error: expect(locator).toHaveText(expected) failed
  Expected: "Cette offre est liée à un stage et ne peut pas être supprimée"
  Received: "Impossible de retirer cette offre"
  ```
  Le scénario 1 passe toujours, ce qui est normal vu qu'il ne touche pas au retrait.
- **Après restauration** du message d'origine : `6 passed (11.5s)`.

## Comparaison : questions de la section 4

### 1. Que permet Playwright MCP dans la conversation avec l'agent ? Quelle action précise avez-vous vu passer par un outil MCP ?

Playwright MCP donne à l'agent un vrai navigateur qu'il pilote lui-même pendant la conversation. Il peut ouvrir l'application, lire l'état de la page, cliquer, remplir des champs, etc, puis nous rendre compte de ce qu'il observe. L'agent vérifie le comportement réel de l'interface et peut ajuster sa démarche selon ce qu'il voit à l'écran.

Action vue passer par un outil MCP : lors du scénario 2, l'agent s'est connecté en tant que Julien Lambert, est allé sur la page « Offres » (`browser_navigate`, puis `browser_click`) et a cliqué sur le bouton « Retirer l'offre Offre de test non retirable » (`browser_click`). Il a ensuite accepté la fenêtre de confirmation (`browser_handle_dialog`) et relu la page (`browser_snapshot`) pour constater que le message « Cette offre est liée à un stage et ne peut pas être supprimée » s'affichait et que l'offre restait dans la liste.

### 2. Qu'apportent les scripts Playwright Test que le compte rendu d'un test par MCP n'apporte pas ?

- **La reproductibilité** : le script ([recherche-offres.spec.ts](../../tests/e2e/recherche-offres/recherche-offres.spec.ts)) rejoue exactement les mêmes étapes à chaque fois, alors qu'un compte rendu MCP décrit une exploration unique que l'agent pourrait mener autrement la fois suivante.
- **Des assertions explicites** : `expect(...).toHaveText(...)` ou `toContainText("Soumise")` définissent précisément ce qui est attendu. Un compte rendu MCP reste une interprétation en langage naturel par l'agent, qui peut se tromper ou enjoliver.
- **Un environnement contrôlé** : la configuration lance le backend avec une base de données temporaire et réinitialisée, ainsi que le frontend sur des ports dédiés. Chaque exécution part donc du même état.
- **Le multi-navigateur et l'automatisation** : le même test tourne sur Chromium, Firefox et WebKit, en local comme en CI, sans intervention humaine ni appel au modèle.
- **Une trace versionnée** : le script fait partie du dépôt, il est relu en revue de code et sert de test de non-régression. On obtient aussi un rapport HTML et des traces en cas d'échec.

### 3. Dans quel cas préféreriez-vous une exploration interactive avec MCP ? Dans quel cas préféreriez-vous un test automatisé ?

**MCP** : pour découvrir une fonctionnalité nouvelle ou mal connue, vérifier rapidement qu'un changement fonctionne dans le vrai navigateur, reproduire et diagnostiquer un bug, ou trouver les bons sélecteurs avant d'écrire un test. C'est aussi utile quand le comportement attendu n'est pas encore clairement défini et qu'on veut d'abord observer.

**Playwright Test** : dès qu'un parcours est important pour le métier et qu'on veut le vérifier à chaque modification, en CI, sur plusieurs navigateurs. Le test automatisé protège contre les régressions, son résultat est objectif et il ne dépend pas de l'agent.

