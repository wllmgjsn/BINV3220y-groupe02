/** Construit une adresse prenom.nom@domaine, en minuscules, sans accents ni espaces. */
export const emailAddress = (firstName: string, lastName: string, domain: string): string =>
  `${firstName}.${lastName}@${domain}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s']/g, "");
