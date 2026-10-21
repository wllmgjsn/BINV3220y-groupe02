# Observations

### Qu'ai-je appris ?
- Copilot semble supprimer les données avant de les réecrire, ce qui peut entraîner la perte d’informations importantes. Il est donc nécessaire de vérifier les modifications apportées par Copilot avant de les valider.

### Ce qui a bien fonctionné
- Le filtrage des offres a été implémenté et était fonctionnel.

### Ce qui n'a pas bien fonctionné
- Le filtrage des offres ne se basait pas sur les paramètres de la requête et se faisait via un état dans le composant React. ce qui n'était pas correct alors qu'il faudrait que le filtrage se fasse côté backend en fonction des paramètres de la requête.

- Tous les cas d'erreurs n'ont pas testés, ce qui a entraîné des erreurs non gérées dans l'application.

### Total de crédits utilisés
- 4% de l'utilisation totale de Copilot pour ce projet.