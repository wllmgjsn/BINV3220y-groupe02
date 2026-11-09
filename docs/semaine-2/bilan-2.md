# Observations

### Qu'ai-je appris ?
- Copilot semble assumer des logiques métiers qui privilégient la cohérence des données par rapport au contexte (exemple : unicité d'une candidature non-retirée pour une entreprise pour un étudiant, ce n'était pas précisé).

### Ce qui a bien fonctionné
- Copilot a bien géré l'état des offres ainsi que la logique métier des candidatures pour une offre. Il n'est pas possible de se retrouver avec plusieurs candidatures dans un état autre que "retiré" pour une même offre par étudiant et il n'est pas non plus possible de candidater pour une offre à laquelle on a déjà été sélectionné.

### Ce qui a moins bien fonctionné
- Il n'y avait aucun bouton pour voir les candidatures qui ont été retirées.

### Total de crédits utilisés
- 5% de l'utilisation totale de Copilot pour cette semaine

### Choix
- Pendant l'élaboration du plan: 
    - L'ia nous propose d'implémenter les EF 32 et 33 séparément, ou ensemble : nous avons choisit ensemble.
    -L'ia nous demande si une candidature doit être unique pour une offre et un candidat : nous précisons que oui, sauf si toutes les offres existantes pour ce candidat sont WITHDRAWN.
    -L'ia note une contradiction dans les instructions (ligne 203 du chat) : elle demande quelles sont les conditions pour retirer une candidature : nous précisons "seulement si "in progress".


### Résultat
- Le résultat est satisfaisant, mais après réflexion nous nous rendons compte que garder toutes les candidatures retirées polluerait le tableau de bord d'un candidat indécis et l'agent n'y a pas pensé, nous prenons alors la décision d'ajouter un bouton pour les filtrer.

### Modifications
Les fichiers application.controllers.ts, qui ajoute la route pour montrer, ajouter et retirer des candidatures, application.repository pour aller chercher les candidatures. ainsi que des fichiers de tests ont étés modifiés coté backend. Côté frontend, il y a ApplicationsPage qui affiche les candidatures, ainsi que les tests. 

### Validation fonctionnelle
Si on exclus le détail de l'affichage sans filtres de toutes les candidatures d'un étudiant, pouvant surcharger visuellement l'utilisateur ayant retiré trop de candidatures, que nous avons corrigé, tout est fonctionnel, tout les cas demandés ont été testé manuellement.

### Qualité
Amélioration possible de l'inteface graphique, mais tout de même satifaisant. 

La route pour retirer les candidatures s'appelle patch, discutable mais correct : l'interface des entreprises n'ayant pas été implémentée donc nous laissons cela tel quel.

On remarque un peu de redondance dans le code : findStatus de applications.repository est inutile.

Le nommage de certaines méthodes est un peu confus, ne décrivant pas clairement à quoi elles servent : findOneByStudent par exemple, son nom laisserait croire qu'on cherche une candidature au hasard, or elle devrait plutôt être nommée , par exemple, findByIdForStudent. Nous avons décider de laisser cela tel quel, en attendant l'implémentations des fonctionnalités de candidatures côté entreprises.

### Tests et commandes

**Tests ajoutés**
- Backend : `tests/applications.test.ts` (candidater, consulter, retirer), `tests/db/constraints.test.ts` (unicité d'une candidature active), `tests/db/migrations.test.ts` (migration 002).
- Frontend : `tests/ApplicationsPage.test.tsx` (affichage, retrait, masquage des candidatures retirées, état vide), `tests/OffersPage.test.tsx` (formulaire de candidature, message facultatif), `tests/NavBar.test.tsx`.

**Commandes exécutées**
- Pas de script `npm run check` dans le projet : nous avons lancé `npm run test`.
- Backend : 126/126 tests passés.
- Frontend : 52/52 tests passés.

**Exemple de comportement couvert**
- Retirer une candidature déjà traitée renvoie une erreur 409 : seule une candidature « En cours » peut être retirée.
