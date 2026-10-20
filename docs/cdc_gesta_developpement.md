# Cahier des charges de développement — refonte de Gesta

Version de développement — 15 octobre 2026

Ce document sert de base au développement de la nouvelle application de gestion des stages. Il part de la première version du cahier des charges (`Solution_seance_cdc/cdc_gesta_v1.md`) et des matrices de traçabilité associées. Il intègre les décisions prises par le client le 15 octobre 2026 sur les questions que cette version laissait ouvertes.

Conventions de lecture :

- Les références **§section.phrase** renvoient à l'interview numérotée (`interview_numerotee/minutes_interview_gesta_numerotees.md`).
- Les références **D-xx** renvoient aux décisions du client (partie 9).
- Les références **H-xx** renvoient aux hypothèses de travail : elles ne sont pas validées par le client et peuvent être révisées (partie 10).
- Chaque exigence est numérotée : **EF** pour les exigences fonctionnelles, **RG** pour les règles de gestion, **ENF** pour les exigences non fonctionnelles et **MIG** pour la reprise des données.
- « Doit » signale une exigence obligatoire ; « peut » signale une possibilité offerte à l'utilisateur.


## 1. Contexte

Gesta est l'application actuellement utilisée par l'école pour gérer les stages des étudiants en entreprise (§1.1). Elle contient les entreprises ou lieux de stage, leurs contacts, les étudiants, les propositions de stage, les stages attribués, la supervision interne et les conventions (§11.1).

Les problèmes principaux de l'existant sont :

- **Accès des entreprises peu fiable.** Les entreprises se connectent avec des liens de gestion individuels. Certains liens sont périmés, les permissions sont peu claires et des liens doivent être régénérés (§4.3 à §4.5). Une entreprise qui reçoit un lien défectueux peut simplement ne pas soumettre d'offre. Comme les entreprises travaillent avec plusieurs établissements, cela peut faire perdre des offres et des partenaires (§4.6, §4.7).
- **Doublons.** Quand les étudiants encodent eux-mêmes leur stage, ils recréent parfois une entreprise ou un contact déjà présent (§5.1, §5.2).
- **Exports incomplets.** Seuls les étudiants, les lieux et les contacts peuvent être exportés ; les stages et les propositions ne le peuvent pas (§8.4, §8.5).
- **Rôles confus.** Le terme « promoteur » est utilisé de façon générique et les rôles des contacts ne sont pas distingués (§3.4).


## 2. Objectifs

| Code | Objectif | Source |
|---|---|---|
| O1 | Ne pas perdre de partenaires : rendre l'accès des entreprises simple et fiable. | §4.8 |
| O2 | Récolter les propositions de stage des entreprises et les présenter aux étudiants sans charge manuelle excessive, en gardant la relecture avant publication. | §4.9 |
| O3 | Maintenir une base fiable des entreprises et des contacts, sans doublons. | §3.2, §5.3, §5.4 |
| O4 | Savoir quel étudiant est ou a été en stage dans quelle entreprise, année après année. | §3.2, §3.16, §6.4 |
| O5 | Reprendre les données exportables de Gesta (étudiants, lieux, contacts) avec leurs relations. | §8.20, §8.21 |
| O6 | Produire les conventions de stage à partir d'un modèle et suivre leur signature. | §3.23, D-15 |


## 3. Périmètre

### 3.1 Inclus

- Gestion des entreprises (lieux de stage) et de leurs contacts.
- Dépôt des offres de stage par les entreprises et relecture par l'administrateur.
- Publication des offres, consultation et candidature par les étudiants.
- Sélection de l'étudiant retenu par l'administrateur et création du stage.
- Déclaration par l'étudiant d'un stage trouvé lui-même, puis validation par l'administrateur.
- Génération des conventions à partir d'un modèle et suivi de leur statut.
- Gestion des années académiques et des périodes de stage.
- Aide à la prévention des doublons et fusion manuelle.
- Export de la liste des contacts à relancer chaque année.
- Reprise des données des trois exports Excel actuels.

### 3.2 Exclu (D-01, D-02, D-19 à D-22)

Les éléments suivants ne font pas partie de cette version. Les modèles de données ne doivent pas pour autant en empêcher l'ajout ultérieur.

- Base des lecteurs, horaires de défense, pré-jurys, jurys et choix des lectures (§7.3 à §7.21).
- Dépôt des TFE et de leurs descripteurs (§7.22, §7.23), y compris les « Titres » du schéma manuscrit.
- Évaluation du stage par le promoteur et notes (§7.24 à §7.27).
- Visites de stage et retours de visite (§7.28).
- Transmission d'informations à la bibliothèque (§7.29, §7.30).
- Mailing automatique de relance (§4.2, D-13).
- Messagerie intégrée avec les entreprises : les échanges restent par téléphone ou par mail, hors application (§3.12, §3.13).
- Journal détaillé des modifications des offres (§3.14).
- Reprise de l'historique des stages et des offres (D-16).
- Signature électronique des conventions (D-15).
- Comptes utilisateurs pour les professeurs superviseurs (D-10).


## 4. Acteurs et rôles

### 4.1 Administrateur (côté école)

Il peut y avoir plusieurs administrateurs (D-06). Tous ont les mêmes droits, sur toute l'application :

- relire, valider, mettre en attente, modifier et archiver les offres ;
- consulter les candidatures et sélectionner l'étudiant retenu ;
- valider, corriger ou refuser les stages déclarés par les étudiants ;
- gérer les entreprises, les contacts et leurs rôles, et fusionner les doublons ;
- générer les conventions et suivre leur statut ;
- gérer les années académiques, les périodes et le modèle de convention ;
- importer les données et exporter la liste de relance ;
- gérer les comptes administrateurs et étudiants.

Ce rôle regroupe les deux responsables internes actuels, celui des offres et celui de l'administratif (§2.1 à §2.3).

### 4.2 Contact d'entreprise

Un contact est une personne rattachée à une ou plusieurs entreprises (§8.13, §8.18). Il peut cumuler les rôles suivants (§3.6 à §3.8, D-05) :

| Rôle | Signification | Droits dans l'application |
|---|---|---|
| **Déposant** | Propose des offres de stage. | Créer des offres pour ses entreprises, puis consulter et modifier celles qu'il a déposées tant qu'elles ne sont pas publiées. |
| **Signataire** | Responsable de la convention et de sa signature. | Aucune action dans l'application. Son nom et l'adresse de l'entreprise sont injectés dans la convention. |
| **Promoteur** | Suit concrètement l'étudiant pendant le stage. | Consulter les stages dont il est le promoteur. |

Un contact sans aucun rôle reste enregistré, mais ne peut pas se connecter.

Les droits d'un contact se limitent aux entreprises auxquelles il est rattaché.

### 4.3 Étudiant

L'étudiant peut :

- consulter les offres publiées (§2.5) ;
- candidater à une offre publiée (D-07) ;
- déclarer un stage qu'il a trouvé lui-même (§2.6, D-08) ;
- consulter ses candidatures et ses stages.

### 4.4 Superviseur interne (pas un utilisateur)

Le superviseur est le professeur de l'école qui suit l'étudiant pendant le stage (§3.20). Il doit être distingué du promoteur d'entreprise (§3.21).

Dans cette version, le superviseur est **une simple information portée par le stage** : son nom est saisi par l'administrateur. Les professeurs n'ont pas de compte (D-10).


## 5. Glossaire

| Terme | Définition |
|---|---|
| Entreprise (lieu de stage) | Organisation qui accueille des stagiaires. Elle peut faire partie d'une autre entreprise (`Fait-partie-de`). |
| Contact | Personne rattachée à une ou plusieurs entreprises, avec zéro, un ou plusieurs rôles. |
| Offre | Sujet de stage proposé par une entreprise **pour un seul étudiant** (D-11). |
| Candidature | Demande d'un étudiant pour une offre publiée. |
| Stage | Dossier qui associe un étudiant, une entreprise, un sujet, des dates et des encadrants pour une année et une période. Il provient d'une offre ou d'une déclaration de l'étudiant. |
| Convention | Document généré à partir d'un modèle pour un stage, avec son statut de signature. |
| Année académique | Période de septembre à juin, par exemple « 2026-2027 » (§6.2). |
| Période de stage | Subdivision de l'année : P1 de septembre à décembre, P2 de février à fin mai environ (§6.3), ou « Autre ». |


## 6. Règles de gestion

| Code | Règle | Source |
|---|---|---|
| RG-01 | Une offre ne concerne qu'un seul étudiant. Une entreprise qui veut accueillir plusieurs stagiaires dépose plusieurs offres. | D-11, §2.10 |
| RG-02 | Une offre n'est visible des étudiants qu'après validation par un administrateur. | §3.9, §3.11, §4.9 |
| RG-03 | Un étudiant ne peut candidater qu'à une offre au statut « Publiée ». | D-07 |
| RG-04 | Quand l'administrateur sélectionne un candidat, l'offre passe au statut « Attribuée », le stage est créé et les autres candidatures à cette offre passent au statut « Non retenue ». | D-09, §3.15 |
| RG-05 | Un stage déclaré par l'étudiant ne compte qu'après validation par un administrateur. Aucune auto-validation n'est possible. | D-08 |
| RG-06 | Une offre liée à un stage ne peut pas être supprimée, seulement archivée. Une offre sans stage peut être supprimée. | D-12 |
| RG-07 | Un contact peut cumuler plusieurs rôles et être rattaché à plusieurs entreprises. | §3.7, §3.8, §8.13 |
| RG-08 | Un contact doit être rattaché à au moins une entreprise. | §8.18 |
| RG-09 | Chaque stage est rattaché à une année académique et à une période. Les listes sont filtrées par année et période ; les données des différentes années ne se mélangent pas. | §6.1, §6.4 |
| RG-10 | Un étudiant peut avoir plusieurs stages, par exemple quand il recommence l'année suivante. Les stages passés sont conservés. | §6.5, §3.2 |
| RG-11 | Le promoteur d'un stage doit être un contact de l'entreprise du stage, avec le rôle « Promoteur ». | §3.6 |
| RG-12 | Une convention ne peut être générée que si l'entreprise a un nom, une adresse et au moins un contact « Signataire ». | D-15 |
| RG-13 | Les entreprises et contacts créés par un étudiant gardent le statut « À vérifier » jusqu'à la validation du stage. | D-08, D-14 |
| RG-14 | Il n'y a pas de mot de passe : tous les utilisateurs se connectent par un lien à usage unique envoyé par e-mail. | D-04, H-01 |


## 7. Exigences fonctionnelles

### 7.1 Authentification

| Code | Exigence |
|---|---|
| EF-01 | L'utilisateur saisit son adresse e-mail. Si elle correspond à un compte actif, l'application envoie un lien de connexion à usage unique, valable 30 minutes (H-02). |
| EF-02 | Le lien ouvre une session dont la durée est configurable. Un lien expiré ou déjà utilisé affiche un message clair et un bouton « Recevoir un nouveau lien ». L'administrateur n'a jamais à régénérer de lien à la main (O1). |
| EF-03 | Pour une adresse inconnue, l'application affiche le même message que pour une adresse connue, afin de ne pas révéler quelles adresses existent. |
| EF-04 | L'administrateur peut activer ou désactiver un compte (contact, étudiant ou administrateur). |
| EF-05 | Les anciens liens de gestion de Gesta (`Lien-partenaire`) ne donnent accès à rien dans la nouvelle application (§8.15). |

### 7.2 Entreprises et contacts

| Code | Exigence |
|---|---|
| EF-10 | L'administrateur peut rechercher, créer, modifier et archiver une entreprise. |
| EF-11 | La fiche entreprise affiche son identité, ses coordonnées, ses contacts avec leurs rôles, ses offres et ses stages, filtrés par année académique. |
| EF-12 | L'administrateur peut créer un contact, le rattacher à une ou plusieurs entreprises et lui attribuer ou retirer des rôles. |
| EF-13 | Pendant la saisie d'une entreprise ou d'un contact, quel que soit l'utilisateur, l'application recherche les fiches proches et les propose. Pour une entreprise, elle compare le nom complet, le nom abrégé et la localité ; pour un contact, le nom, le prénom et l'e-mail. Elle tolère les différences de casse, d'accents et de petites fautes de frappe (D-14). |
| EF-14 | L'administrateur peut fusionner deux entreprises ou deux contacts. La fusion conserve toutes les associations : contacts, offres, stages et rattachements (§8.18). L'administrateur choisit, champ par champ, la valeur à garder. |
| EF-15 | L'administrateur voit la liste des fiches « À vérifier » et peut les confirmer ou les fusionner avec une fiche existante. |

### 7.3 Offres de stage

| Code | Exigence |
|---|---|
| EF-20 | Un contact déposant crée une offre pour une de ses entreprises. Il indique le titre, la description du sujet, l'année académique, la période souhaitée et le contact promoteur prévu. Le promoteur est facultatif au dépôt. |
| EF-21 | Une offre déposée a le statut « Soumise ». Le déposant peut la modifier ou la retirer tant qu'elle n'est pas publiée. |
| EF-22 | L'administrateur voit la liste des offres soumises et en attente. Pour chacune, il peut **valider** (elle devient « Publiée »), **mettre en attente**, **modifier** la description ou les personnes associées, ou **supprimer** l'offre (dans le respect de RG-06) (§3.10). |
| EF-23 | L'administrateur peut aussi créer une offre lui-même, au nom d'une entreprise, par exemple à partir d'une proposition reçue par mail (§4.11). |
| EF-24 | L'administrateur peut archiver une offre publiée qui n'a pas trouvé d'étudiant. |
| EF-25 | Aucun historique des changements de statut n'est conservé, à part la date de dernière modification (§3.14). |

Cycle de vie d'une offre :

```
Soumise ──► Publiée ──► Attribuée ──► Archivée
   │  ▲         │
   ▼  │         └────────► Archivée (non pourvue)
En attente
   │
   ▼
Supprimée (seulement si aucun stage n'y est lié)
```

### 7.4 Consultation et candidature des étudiants

| Code | Exigence |
|---|---|
| EF-30 | L'étudiant consulte le catalogue des offres publiées de l'année académique en cours. Il peut filtrer par période, entreprise et localité, et chercher par mot-clé. |
| EF-31 | Le détail d'une offre affiche l'entreprise, la localité, le sujet, la période et un contact de l'entreprise. |
| EF-32 | L'étudiant candidate à une offre publiée, avec un message facultatif. Il peut retirer sa candidature tant qu'elle n'a pas été traitée. |
| EF-33 | L'étudiant voit ses candidatures et leur statut : « En cours », « Retenue », « Non retenue » ou « Retirée ». |
| EF-34 | L'administrateur voit, pour chaque offre publiée, la liste des candidats. Il sélectionne l'étudiant retenu, en règle générale après un échange hors application avec l'entreprise (D-09). La sélection applique RG-04. |
| EF-35 | L'application n'envoie pas de notification automatique liée aux candidatures. Les statuts sont visibles dans l'application (H-03). |

### 7.5 Stage déclaré par l'étudiant

| Code | Exigence |
|---|---|
| EF-40 | L'étudiant déclare un stage trouvé lui-même, sans offre préalable (§2.6, §3.18). Il recherche d'abord l'entreprise, puis le contact promoteur, parmi les fiches existantes (EF-13). S'il ne les trouve pas, il les crée : elles prennent le statut « À vérifier ». |
| EF-41 | Il saisit ensuite le sujet, les dates de début et de fin, l'année académique et la période. Le stage a alors le statut « Déclaré ». |
| EF-42 | L'administrateur voit la liste des stages déclarés. Il peut les valider (statut « Validé »), les corriger avant validation ou les refuser avec un motif visible par l'étudiant (D-08). |

### 7.6 Dossier de stage

| Code | Exigence |
|---|---|
| EF-50 | Un stage contient : l'étudiant, l'entreprise, le sujet, l'offre d'origine s'il y en a une, le promoteur, le nom du superviseur interne, les dates de début et de fin, l'année académique, la période, le statut et la convention (§3.17, §3.22). |
| EF-51 | L'administrateur peut saisir ou modifier le nom du superviseur interne. Ce champ peut rester vide. L'application propose une liste « Stages sans superviseur » (D-10). Les superviseurs habituels de l'entreprise, repris de l'export, sont affichés à titre indicatif (§8.9). |
| EF-52 | L'administrateur peut corriger un stage validé : dates, promoteur, superviseur ou sujet. |
| EF-53 | La fiche étudiant affiche tous ses stages, triés par année et par période (RG-10). |
| EF-54 | Le promoteur voit la liste des stages qu'il suit, avec l'étudiant, les dates et le nom du superviseur. |
| EF-55 | L'administrateur peut annuler un stage, par exemple en cas d'abandon. Le stage reste dans l'historique avec le statut « Annulé ». |

Cycle de vie d'un stage : `Déclaré → Validé → Terminé`, avec `Refusé` à partir de « Déclaré » et `Annulé` à partir de « Validé ». Un stage créé par la sélection d'un candidat (EF-34) commence directement au statut « Validé ». « Terminé » est attribué automatiquement après la date de fin.

### 7.7 Convention

| Code | Exigence |
|---|---|
| EF-60 | L'administrateur dépose et remplace le modèle de convention : un document avec des champs à remplacer (H-04). |
| EF-61 | Depuis un stage validé, l'administrateur génère la convention. L'application injecte dans le modèle le nom de l'entreprise, son adresse et le nom du contact signataire (D-15). S'il y a plusieurs signataires, l'administrateur en choisit un. |
| EF-62 | Le document généré est téléchargeable et conservé dans le dossier du stage. La convention a alors le statut « Générée ». |
| EF-63 | L'administrateur dépose le PDF signé ; la convention passe au statut « Signée » et la date de dépôt est enregistrée. |
| EF-64 | L'administrateur peut régénérer une convention « Générée », par exemple après une correction de l'adresse. Une convention « Signée » ne peut pas être régénérée. |
| EF-65 | L'application propose une liste des stages validés dont la convention est absente ou n'est pas encore signée, filtrable par année et période. |

### 7.8 Années académiques et périodes

| Code | Exigence |
|---|---|
| EF-70 | L'administrateur crée les années académiques (libellé, date de début, date de fin) et définit l'année en cours. |
| EF-71 | Les périodes sont configurables par année. Par défaut : P1 de septembre à décembre, P2 de février à mai, et « Autre » (§6.3). Les dates d'un stage peuvent sortir des bornes de sa période ; l'application affiche alors un avertissement, sans bloquer. |
| EF-72 | Les listes d'offres, de candidatures, de stages et de conventions sont filtrées par défaut sur l'année en cours. |

### 7.9 Relance annuelle

| Code | Exigence |
|---|---|
| EF-80 | L'administrateur exporte au format Excel la liste des contacts à relancer (D-13). Les filtres disponibles sont : rôle (déposant par défaut), entreprises ayant proposé une offre ou accueilli un stage pendant une année donnée, et entreprises non archivées. |
| EF-81 | L'export contient l'entreprise, le nom, le prénom, l'e-mail et le rôle du contact. L'envoi des relances se fait hors application, avec la messagerie habituelle. Le message indique simplement l'adresse de l'application ; le contact y demande lui-même son lien de connexion (EF-01). |

### 7.10 Administration

| Code | Exigence |
|---|---|
| EF-90 | L'administrateur gère les comptes administrateurs et étudiants (création, désactivation). Les comptes étudiants peuvent être créés par import (MIG-01). |
| EF-91 | L'administrateur peut exporter au format Excel les étudiants, les entreprises, les contacts, les offres et les stages. L'export des stages et des offres répond à une limite de l'existant (§8.4). |


## 8. Données

### 8.1 Modèle conceptuel

```
Entreprise 1 ──── * Rattachement * ──── 1 Contact ──── * RôleContact
    │  └── 0..1 Fait-partie-de (Entreprise)
    │
    ├── * Offre ──── * Candidature * ──── 1 Étudiant
    │       │                                │
    │       └── 0..1 ──── Stage * ───────────┘
    │                       │
    └── * Stage ────────────┤── 0..1 Promoteur (Contact)
                            ├── 1 AnnéeAcadémique, 1 Période
                            └── 0..1 Convention ──── 1 Signataire (Contact)
```

### 8.2 Entités

| Entité | Attributs principaux |
|---|---|
| **Entreprise** | id, nom complet, nom abrégé, type de lieu, entreprise mère (`Fait-partie-de`), adresse, localité, téléphone, GSM, e-mail, superviseurs habituels (jusqu'à 3, texte), contact direction (nom, e-mail, téléphone), date de début de collaboration, attributs repris de l'existant (`inter.`, `except.`, `Spécialisé`, `Accord-de-collaboration`, `Accord-commune`, `Visite-médicale-CESI`), statut (actif / à vérifier / archivé) |
| **Contact** | id, intitulé, nom, prénom, e-mail (unique), GSM, fonction(s), statut (actif / à vérifier / désactivé), rôles (déposant, signataire, promoteur) |
| **Rattachement** | contact, entreprise |
| **Étudiant** | id, matricule (unique), nom, prénom, e-mail, date de naissance, cohorte, implantation, section, nombre de stages antérieurs (repris de l'existant), statut du compte |
| **Offre** | id, entreprise, déposant, titre, description, année académique, période souhaitée, promoteur prévu, statut, date de création, date de dernière modification |
| **Candidature** | id, offre, étudiant, message, statut, date |
| **Stage** | id, étudiant, entreprise, offre d'origine (facultative), sujet, promoteur, nom du superviseur interne, date de début, date de fin, année académique, période, statut, motif de refus |
| **Convention** | id, stage, signataire, document généré, PDF signé, statut (générée / signée), date de génération, date de signature |
| **AnnéeAcadémique** | id, libellé, date de début, date de fin, année en cours (oui/non) |
| **Période** | id, année académique, code (P1, P2, Autre), date de début, date de fin |
| **Administrateur** | id, nom, prénom, e-mail, statut |
| **ModèleConvention** | id, fichier, date de dépôt, actif (oui/non) |

### 8.3 Reprise des données existantes

Les trois exports Excel de Gesta doivent pouvoir être importés (§8.20, §8.21). La reprise ne fixe ni le format de stockage ni l'architecture cible (§8.23). Elle peut être faite une seule fois, au démarrage ; un outil d'import permanent n'est pas exigé.

| Code | Exigence |
|---|---|
| MIG-01 | Importer l'export **Étudiants** selon la correspondance 8.3.1. Le matricule identifie l'étudiant. |
| MIG-02 | Importer l'export **Lieux** selon la correspondance 8.3.2, avant les contacts. |
| MIG-03 | Importer l'export **Contacts** selon la correspondance 8.3.3. Créer un rattachement pour chaque valeur de `Lieu(x)`, en la faisant correspondre au `Nom-abrégé` d'une entreprise (§8.17, §8.19). |
| MIG-04 | Convertir les valeurs suivantes : « oui » / « non » en booléen ; le marqueur « ?! » et les cellules vides en valeur vide ; les dates au format numérique Excel en dates (§8.8, §8.11, D-17). |
| MIG-05 | Ne jamais abandonner de ligne sans le signaler. Produire un rapport d'import qui indique, pour chaque fichier, le nombre de lignes importées, les lignes rejetées avec leur motif (par exemple un `Lieu(x)` introuvable ou un doublon d'e-mail) et les doublons potentiels détectés. |
| MIG-06 | Valider la reprise sur les fichiers anonymisés (`gesta_*_anonymise.xlsx`) avant l'import réel. |
| MIG-07 | Ne pas reprendre l'historique des stages ni celui des offres (§8.4, D-16). |

#### 8.3.1 Étudiants

| Colonne | Destination |
|---|---|
| Matricule | Étudiant.matricule |
| Nom, Prénom, Email | Étudiant.nom, prénom, e-mail |
| Date-Naissance | Étudiant.date de naissance (conversion de date) |
| Cohorte, Implantation, Section | Étudiant.cohorte, implantation, section (repris tels quels) |
| Nombre-Stage | Étudiant.nombre de stages antérieurs (information historique, non recalculée) |

#### 8.3.2 Lieux

| Colonne | Destination |
|---|---|
| Nom-complet, Nom-abrégé, Type-de-lieu | Entreprise.nom complet, nom abrégé, type de lieu |
| Fait-partie-de | Entreprise.entreprise mère, par correspondance avec un nom abrégé ou un nom complet ; si aucune entreprise ne correspond, la valeur est conservée en texte et signalée dans le rapport |
| Localite, Adresse | Entreprise.localité, adresse |
| Superviseur-1 à Superviseur-3 | Entreprise.superviseurs habituels (texte) |
| inter., except., Spécialisé, Accord-de-collaboration, Accord-commune, Visite-médicale-CESI | Attributs booléens de l'entreprise, repris tels quels (D-17) |
| Téléphone-, GSM-, Email-Etablissement | Entreprise.téléphone, GSM, e-mail |
| Date-collaboration | Entreprise.date de début de collaboration (conversion de date) |
| Contact-Direction, Email-Direction, Téléphone-Direction | Entreprise.contact direction (nom, e-mail, téléphone) |

#### 8.3.3 Contacts

| Colonne | Destination |
|---|---|
| Intitulé, Nom, Prénom, Email, GSM | Contact.intitulé, nom, prénom, e-mail, GSM |
| Lien, Type-lieu(x) | Contrôle de cohérence avec le type de lieu des entreprises rattachées ; non stockés séparément |
| Fonction(s) | Contact.fonction(s) |
| Lieu(x) | Rattachement(s) vers les entreprises (MIG-03) |
| Localite, Nom-Direction, Email-Direction | Non repris : ces données existent déjà sur l'entreprise. Une différence avec l'entreprise est signalée dans le rapport. |
| Lien-partenaire | Non repris : l'ancien accès n'est pas réactivé (EF-05). |
| édit.-offres = oui | Rôle **Déposant** |
| maî.-stage = oui | Rôle **Promoteur** |
| Fonction contenant « convention » ou « signature » | Rôle **Signataire**, proposé à l'administrateur puis confirmé après import (H-05) |
| édit.-lieux | Non repris comme droit : la modification des entreprises est réservée aux administrateurs |


## 9. Décisions du client (15 octobre 2026)

| Code | Question | Décision |
|---|---|---|
| D-01 | Activités connexes (TFE, jurys, lecteurs, évaluations, bibliothèque) | Hors périmètre. |
| D-02 | Visites de stage | Hors périmètre. |
| D-03 | Type d'application | Application web. |
| D-04 | Accès des entreprises | Lien de connexion envoyé par e-mail, sans mot de passe. |
| D-05 | Rôles des contacts | Trois rôles cumulables : déposant, signataire, promoteur. |
| D-06 | Rôles côté école | Un seul rôle, administrateur, avec plusieurs administrateurs possibles. Il couvre les offres et les conventions. |
| D-07 | Candidatures | Conservées : l'étudiant candidate aux offres publiées. |
| D-08 | Stage trouvé par l'étudiant | L'étudiant le déclare, un administrateur le valide ; pas d'auto-validation. |
| D-09 | Sélection du candidat | Faite par l'administrateur. |
| D-10 | Superviseur interne | Simple information sur le stage, sans compte pour les professeurs. |
| D-11 | Plusieurs étudiants pour une offre | Non : une offre par étudiant. Une entreprise peut avoir plusieurs offres. |
| D-12 | Suppression d'une offre attribuée | Proposition acceptée par défaut : archivage seulement. |
| D-13 | Relance annuelle | Export de la liste des contacts ; pas de mailing intégré. |
| D-14 | Doublons | Recherche approximative pendant la saisie et fusion manuelle par l'administrateur. |
| D-15 | Convention | Générée à partir d'un modèle (nom et adresse de l'entreprise, nom du signataire), avec suivi du statut et dépôt du PDF signé. |
| D-16 | Historique des stages et des offres | Non repris. |
| D-17 | Colonnes ambiguës des exports | Reprises telles quelles, avec conversion des oui/non et des marqueurs. |
| D-18 | Volumes et hébergement | Hypothèses de la partie 11 retenues par défaut. |
| D-19 à D-22 | Jurys, évaluations et notes, bibliothèque, « Titres » du schéma | Hors périmètre. |


## 10. Hypothèses de travail (à confirmer)

| Code | Hypothèse |
|---|---|
| H-01 | La connexion par lien envoyé par e-mail s'applique à tous les utilisateurs, y compris les étudiants (sur leur adresse institutionnelle) et les administrateurs. Un seul mécanisme. |
| H-02 | Le lien de connexion est valable 30 minutes et ne sert qu'une fois. |
| H-03 | L'application n'envoie pas d'autres e-mails que les liens de connexion. |
| H-04 | Le modèle de convention est un document Word avec des champs à remplacer, par exemple `{{entreprise_nom}}`, `{{entreprise_adresse}}` et `{{signataire_nom}}`. Le format de sortie (Word ou PDF) reste à confirmer. |
| H-05 | Le rôle « Signataire » n'existe pas comme indicateur dans l'export. Il est proposé à partir de la fonction du contact, puis confirmé par l'administrateur. |
| H-06 | Seuls les administrateurs créent les entreprises et les contacts déposants. Une entreprise inconnue qui souhaite proposer un stage contacte l'école, qui crée son accès. |


## 11. Exigences non fonctionnelles

| Code | Exigence |
|---|---|
| ENF-01 | Application web responsive, utilisable sur ordinateur et sur smartphone, avec les versions récentes des navigateurs courants (D-03). |
| ENF-02 | Interface en français. |
| ENF-03 | Contrôle d'accès par rôle, vérifié côté serveur pour chaque action. |
| ENF-04 | Données personnelles traitées conformément au RGPD : accès limité aux personnes concernées et aucune donnée personnelle dans les URL. |
| ENF-05 | Volumétrie supposée : quelques centaines d'étudiants par an, quelques centaines d'entreprises et quelques milliers de contacts (D-18). |
| ENF-06 | Hébergement par l'école ; pas d'engagement chiffré de disponibilité (D-18). |
| ENF-07 | L'application fonctionne avec un serveur d'envoi d'e-mails configurable, nécessaire aux liens de connexion. |
| ENF-08 | Le modèle de données ne doit pas empêcher l'ajout ultérieur des modules exclus (TFE, jurys, évaluations, visites). |


## 12. Points restant à préciser avec le client

Ces points ne bloquent pas le démarrage du développement : chacun est couvert provisoirement par une hypothèse.

1. Format exact du modèle de convention et éventuels champs supplémentaires, comme le nom de l'étudiant ou les dates du stage (H-04).
2. Inscription spontanée d'une entreprise inconnue (H-06).
3. Sens métier des colonnes `inter.`, `except.` et `Spécialisé`, à documenter même si elles sont reprises telles quelles.
4. Façon d'identifier les signataires dans les données existantes (H-05).


## Documents de référence

- [Interview numérotée](interview_numerotee/minutes_interview_gesta_numerotees.md)
- [Cahier des charges v1 (séance)](Solution_seance_cdc/cdc_gesta_v1.md)
- [Matrice interview → CDC](Solution_seance_cdc/matrice_interview_vers_cdc.html)
- [Matrice CDC → interview](Solution_seance_cdc/matrice_cdc_vers_interview.html)
- Exports anonymisés : `gesta_etudiants_anonymise.xlsx`, `gesta_lieux_anonymise.xlsx`, `gesta_contacts_anonymise.xlsx`
