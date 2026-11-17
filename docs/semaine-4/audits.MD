## Audit des tests de candidature — EF32 et EF33

| Cas à vérifier | Criticité | Tests existant et assertion inutile | Manque confirmé ou constat écarté |
|---|---|---|---|
| Consulter ses candidatures avec une session valide | P1 | `backend/tests/applications.test.ts:29` vérifie la réponse complète et l'isolation par étudiant. Assertion utile. | Constat écarté : le cas nominal est couvert. |
| Refuser l'accès sans session | P1 | `backend/tests/applications.test.ts:16` vérifie le statut `401`. Assertion utile. | Constat écarté. |
| Refuser la consultation à un administrateur | P1 | `backend/tests/applications.test.ts:22` vérifie le statut `403` et le code `FORBIDDEN`. Assertions utiles. | Constat écarté. |
| Créer une candidature sur une offre publiée sans message | P1 | `backend/tests/applications.test.ts:46` vérifie le statut `201`, l'offre, le message `null` et le statut `IN_PROGRESS`. Assertions utiles. | Constat écarté. |
| Réserver la création à un étudiant | P1 | `backend/tests/applications.test.ts:60` vérifie le statut `403` et le code d'erreur. Assertions utiles. | Constat écarté. |
| Nettoyer un message facultatif | P2 | `backend/tests/applications.test.ts:70` vérifie que les espaces sont supprimés. Assertion utile. | Constat écarté. |
| Refuser un message qui n'est pas une chaîne | P2 | `backend/tests/applications.test.ts:80` vérifie le statut `400` et `INVALID_MESSAGE`. Assertions utiles. | Constat écarté. |
| Refuser une candidature sur une offre non publiée | P1 | `backend/tests/applications.test.ts:90` vérifie le statut `409` et `OFFER_NOT_PUBLISHED`. Assertions utiles. | Constat écarté. |
| Empêcher une deuxième candidature active | P1 | `backend/tests/applications.test.ts:100` vérifie le statut `409` et `ALREADY_APPLIED`. Assertions utiles. | Constat écarté. |
| Retirer une candidature puis candidater à nouveau | P1 | `backend/tests/applications.test.ts:110` vérifie le `204`, puis le `201` de la nouvelle candidature. Assertions utiles. | Constat écarté. |
| Empêcher le retrait par un administrateur | P1 | `backend/tests/applications.test.ts:125` vérifie le statut `403` et `FORBIDDEN`. Assertions utiles. | Constat écarté. |
| Empêcher le retrait de la candidature d'un autre étudiant | P1 | `backend/tests/applications.test.ts:134` vérifie le statut `404` et `APPLICATION_NOT_FOUND`. Assertions utiles. | Constat écarté. |
| Empêcher le retrait d'une candidature déjà traitée ou rejetée | P1 | `backend/tests/applications.test.ts:143` et `backend/tests/applications.test.ts:152` vérifient le statut `409` et `APPLICATION_ALREADY_PROCESSED`. Assertions utiles. | Constat écarté. |
| Valider `offerId` à la création | P2 | Aucun test direct pour un corps sans `offerId`, un identifiant nul, négatif, décimal ou de type chaîne. | **Manque confirmé.** Ajouter des tests `400` et vérifier `INVALID_BODY` ou `INVALID_OFFER_ID`. |
| Valider le corps JSON de création | P2 | Aucun test direct pour un tableau ou une valeur non objet envoyé à `POST /applications`. | **Manque confirmé.** Ajouter un test vérifiant `400 INVALID_BODY`. |
| Valider `applicationId` au retrait | P2 | Aucun test direct pour `/applications/not-a-number/withdraw`, `0` ou un identifiant décimal. | **Manque confirmé.** Ajouter des tests vérifiant `400 INVALID_ID`. |
| Afficher une erreur lors d'un échec de retrait dans l'interface | P2 | `frontend/tests/ApplicationsPage.test.tsx:7` vérifie uniquement que la requête `PATCH` est envoyée. L'assertion ne vérifie pas l'état d'erreur. | **Manque confirmé.** Simuler une réponse `4xx/5xx` et vérifier l'alerte affichée. |
| Recharger la liste après un retrait réussi | P2 | `frontend/tests/ApplicationsPage.test.tsx:7` vérifie le `PATCH`, mais pas le nouvel appel `GET` ni la mise à jour de l'affichage. Assertion incomplète. | **Manque confirmé.** Retourner une candidature retirée au second `GET` et vérifier son affichage ou sa disparition selon le filtre. |
| Masquer et afficher les candidatures retirées | P2 | `frontend/tests/ApplicationsPage.test.tsx:7` et `:60` vérifient la case, le filtrage et l'état vide. Assertions utiles. | Constat écarté. |
| Envoyer une candidature depuis la liste des offres | P1 | `frontend/tests/OffersPage.test.tsx:142` vérifie le `POST`, l'offre ciblée, le message envoyé et le rechargement qui remplace l'action par le badge « En cours ». Assertions utiles. | Constat écarté : le parcours de candidature et la mise à jour de l'interface sont couverts. |
| Afficher une erreur après échec de candidature | P2 | Aucun test dédié dans `frontend/tests/OffersPage.test.tsx` pour l'échec de `applyToOffer`. | **Manque confirmé.** Simuler une réponse `409` et vérifier l'alerte visible avec le message d'erreur. |

### Résultat

Les parcours backend principaux d'EF32/EF33 sont bien couverts. Les manques restants concernent principalement les validations d'entrée HTTP et les états d'erreur/rechargement de l'interface frontend.

Tests ciblés exécutés :

- `npm test -w backend -- --run tests/applications.test.ts` — réussi, 14 tests.
- `npm test -w frontend -- --run tests/ApplicationsPage.test.tsx` — réussi, 2 tests.