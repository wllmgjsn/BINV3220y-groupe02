### audits des tests

Le document se trouve dans le même dossier (semaine 4)

Test amélioré : dans `frontend/tests/OffersPage.test.tsx`, le test de candidature depuis la liste des offres vérifiait seulement l'envoi du `POST` ; il vérifie maintenant aussi le rechargement des candidatures et le remplacement du bouton « Candidater » par le badge « En cours ».


### TDD

**Test vu en échec puis en réussite**
- Tests ajoutés avant toute modification applicative dans `backend/tests/offers.test.ts` et `frontend/tests/OffersPage.test.tsx`.
- Rouge : 3 tests backend échouaient (le paramètre `q` était ignoré, l'API renvoyait toutes les offres) et 1 test frontend échouait (champ « Rechercher par titre » absent).
- Vert après implémentation : 19/19 backend, 8/8 frontend ; suite complète (185 tests), lint, typecheck et build réussis.

**Notre avis sur les tests proposés avant l'accord**
- Avant de valider, nous avons vérifié le sens du paramètre `q` (même convention que `GET /companies?q=`) et que l'échec venait bien de la fonctionnalité manquante. Le premier échec frontend venait d'un test mal placé ; il a été corrigé avant d'obtenir un rouge propre.
- Les tests couvraient bien les règles demandées : casse, espaces, expression entière, combinaison avec la période, visibilité étudiant, absence de résultat.
- Limites : pendant la phase verte, deux attentes de test ont été corrigées (période de l'offre « API REST de facturation » dans les données de référence, rôle `searchbox`). Ces corrections étaient justifiées mais montrent qu'il faut relire les tests avant de valider. L'implémentation a aussi ajouté des validations (`q` répété, 100 caractères max) qu'aucun test rouge n'exigeait ; l'audit EF-30 les a ensuite identifiées comme manques.

### Recherche

**Cas essayés (EF-30, recherche dans le titre des offres)**
- Casse ignorée.
- Espaces au début et à la fin ignorés.
- Plusieurs mots : l'expression entière est recherchée.
- Recherche combinée avec le filtre par période.
- Visibilité conservée : un étudiant ne voit que les offres publiées.
- Recherche vide : les offres normalement accessibles sont affichées.
- Aucune correspondance : liste vide et message « Aucune offre ne correspond à la recherche. »

**Résultats de `npm run check`**
- Exécuté le 20/11/2026 : tout passe (tests, lint, typecheck). Aucune erreur.

**Problèmes restants**
- Validation du paramètre `q` non testée : `q` répété et recherche de plus de 100 caractères.
- Caractères spéciaux `%`, `_` et `\` : traités littéralement dans le code, mais pas testés.
- Interface : effacement du champ de recherche et lecture de `q` depuis l'URL non testés.
- Recherche approximative et gestion des accents hors périmètre.


### Utilisation de tokens

nous en sommes à 20 pourcent (pour 2, soit 10 pourcent au total).