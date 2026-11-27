## Tests sélectionnés pour l'end-to-end (scénarios) :

1. Consulter ses candidatures avec une session valide

État initial : aucune session, l'utilisateur n'est pas connecté
Actions à effectuer :
    - Se connecter en tant qu'étudiant (Louis Claes)
    - Appuyer sur l'onglet "Mes candidatures" dans la barre de navigation
Résultat attendus : constater la présence des candidatures de l'étudiant 

2. Afficher une erreur lors d'un échec de retrait dans l'interface

État initial : aucune session, l'utilisateur n'est pas connecté
Actions à effectuer :
    - Se connecter en tant que déposant (Julien Lambert)
    - Appuyer sur l'onglet "Offres" dans la barre de navigation
    - Trouver l'offre "Offre de test non retirable" au statut "Soumise"
    - Cliquer sur le bouton "Retirer" dans la colonne "Action" et confirmer le retrait
    - Constater que le message "Cette offre est liée à un stage et ne peut pas être supprimée" s'affiche
    - Constater que l'offre reste dans la liste
Résultat attendu : Voir un message d'erreur qui dit que l'offre n'a pas pu être retirée
