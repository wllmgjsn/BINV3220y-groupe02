## Fonctionnalité

<!-- Quelle fonctionnalité du cahier des charges ? Indiquez l'exigence (EF-xx, RG-xx) ou l'issue (#…). -->

## Changements

<!-- Ce qui a été ajouté ou modifié, couche par couche (base, API, interface). -->

## Vérifications

- [ ] `npm run check` passe sans erreur ni avertissement
- [ ] Des tests couvrent le nouveau comportement et les cas d'erreur (400, 401, 403, 404…)
- [ ] Les droits sont vérifiés par le backend, pas seulement masqués dans l'interface
- [ ] `backend/API.md` et les fichiers `backend/http/*.http` sont à jour
- [ ] Une évolution du schéma passe par une **nouvelle** migration (`002_….sql`…)
- [ ] Testé dans le navigateur, avec les profils concernés

## Travail avec l'agent

- [ ] Conversation exportée dans `docs/conversation-N.md`

<!-- Ce que l'agent a bien fait, ce qu'il a fallu corriger ou refuser. -->

## Points d'attention pour la revue

<!-- Choix discutables, limites connues, questions. -->
