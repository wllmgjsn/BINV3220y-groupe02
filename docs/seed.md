# Données de démonstration

Toutes les données sont **fictives**. Les adresses en `.test` sont réservées et ne
correspondent à aucun domaine réel.

- Données : `backend/src/db/seed/*Data.ts`
- Identifiants stables, utilisables dans les tests : `backend/src/db/seed/seedIds.ts`
- Recréer la base : `npm run db:reset` (arrêter le serveur avant, surtout sous Windows)

## Années et périodes

Périodes par défaut du cahier des charges (EF-71) : P1 de septembre à décembre, P2 de
février à mai, et « Autre » sur toute l'année.

| Année | En cours | P1 | P2 | OTHER |
|---|:---:|---|---|---|
| 2025-2026 | | 15/09 → 19/12/2025 | 09/02 → 29/05/2026 | 15/09/2025 → 30/06/2026 |
| 2026-2027 | ✓ | 14/09 → 18/12/2026 | 08/02 → 28/05/2027 | 14/09/2026 → 30/06/2027 |

## Utilisateurs utiles pour les démonstrations

| Profil | Personne | Particularité |
|---|---|---|
| Administrateur | Anne Leclercq, Philippe Moreau | |
| Étudiant | Lucas Dupont, Inès Haddad | Candidatures en cours |
| Étudiant | Youssef El Amrani | Candidature en cours |
| Étudiant | Léa Mertens | Candidature non retenue |
| Étudiant | Mateusz Kowalski | Candidature retenue, stage validé chez Datavia |
| Étudiant | Ioana Popescu | Stage déclaré dans une entreprise « À vérifier » |
| Étudiant | Aminata Diallo | Stage terminé en 2025-2026 |
| Étudiant | Dmytro Kovalenko, Louis Claes | Cohorte 2025, sans candidature |
| Déposant | Claire Dumont | Lumen Digital |
| Déposant | Marc Lejeune | Orbis |
| Promoteur | Nadia Cherif | Orbis, promotrice et signataire |
| Multi-entreprises | Julien Lambert | Lumen Digital et Lumen Data ; déposant, promoteur et signataire |

Autres contacts particuliers :
- **Hélène Vermeulen** (Brikk) n'a aucun rôle : elle est enregistrée mais ne peut pas se connecter.
- **Bernard Petit** (Archivium) est désactivé.
- **Yann Delcourt** (Studio Nébula) est « À vérifier » : il a été créé par Ioana lors de sa déclaration.

Les rôles appartiennent au contact et s'exercent dans toutes ses entreprises (CdC § 4.2).

## Entreprises

13 entreprises :
- **Groupe Lumen** est l'entreprise mère de **Lumen Digital** et de **Lumen Data** ;
- **Archivium** est archivée ;
- **Studio Nébula** est « À vérifier » (RG-13) et n'a pas encore d'adresse.

## Offres

| Offre | Entreprise | Déposant | Année | Période | Statut |
|---|---|---|---|---|---|
| Application React de gestion de flotte | Lumen Digital | Claire Dumont | 2026-2027 | P2 | Publiée |
| Refonte du portail client | Lumen Digital | Julien Lambert | 2026-2027 | P2 | Soumise |
| API REST de facturation | Orbis | Marc Lejeune | 2026-2027 | P2 | Publiée |
| Automatisation des tests de bout en bout | Orbis | Marc Lejeune | 2026-2027 | OTHER | En attente |
| Tableau de bord de qualité des données | Lumen Data | Julien Lambert | 2026-2027 | P2 | Publiée |
| Migration d'une application vers le cloud | Datavia | Antoine Leroy | 2026-2027 | P2 | Attribuée |
| Assistant conversationnel interne | Nexalis | Piotr Nowak | 2026-2027 | P2 | Publiée |
| Outil de planification des consultants | Hexagone | Caroline Michel | 2026-2027 | OTHER | Soumise |
| Module de rapports PDF | Orbis | Marc Lejeune | 2025-2026 | P1 | Archivée (non pourvue) |
| Numérisation d'archives papier | Archivium | *aucun* (créée par un administrateur, EF-23) | 2025-2026 | P2 | Archivée (non pourvue) |

## Candidatures et stages

- **Gestion de flotte** : deux candidatures en cours (Lucas, Inès).
- **API de facturation** : Inès a retiré sa candidature ; celle de Youssef est en cours.
- **Migration cloud** : Mateusz a été retenu et Léa non (RG-04). Le stage de Mateusz chez
  Datavia a été créé directement au statut « Validé », avec la promotrice Fatou Ndiaye et le
  superviseur Jean-Luc Dethier.
- Stage d'Aminata chez Vertigo (2025-2026) : déclaré, validé puis terminé.
- Stage d'Ioana chez Studio Nébula (2026-2027) : déclaré, en attente de validation, sans
  superviseur.

Les superviseurs sont de simples noms fictifs : les professeurs n'ont pas de compte (D-10).

## Cohérence vérifiée par les tests

`backend/tests/db/seed.test.ts` vérifie notamment :
- chaque déposant a le rôle de déposant, et chaque promoteur celui de promoteur (RG-11) ;
- chaque contact est rattaché à au moins une entreprise (RG-08) ;
- les fiches « À vérifier » ne sont liées qu'à un stage déclaré (RG-13) ;
- l'offre attribuée, la candidature retenue et le stage sont cohérents (RG-04).

Les cas invalides sont construits uniquement dans `backend/tests/db/constraints.test.ts`.
