// better-sqlite3 13 utilise la N-API 10 de Node, disponible à partir de Node 22.14
// (et 23.6). Avec une version plus ancienne, il plante sans message compréhensible.
const MINIMUM_MINOR_BY_MAJOR: Record<number, number> = { 22: 14, 23: 6 };
const FIRST_MAJOR_WITHOUT_MINIMUM = 24;

/** Message à afficher si cette version de Node est trop ancienne ; undefined sinon. */
export const unsupportedNodeMessage = (version: string = process.versions.node): string | undefined => {
  const [major = 0, minor = 0] = version.split(".").map(Number);
  const minimumMinor = MINIMUM_MINOR_BY_MAJOR[major];

  const isSupported =
    major >= FIRST_MAJOR_WITHOUT_MINIMUM || (minimumMinor !== undefined && minor >= minimumMinor);
  if (isSupported) return undefined;

  return [
    `Node ${version} est trop ancien pour ce projet (base de données better-sqlite3).`,
    "Mettez Node à jour : Node 24 LTS (recommandé), ou au minimum Node 22.14.",
    "Téléchargement : https://nodejs.org — puis relancez la commande.",
  ].join("\n");
};
