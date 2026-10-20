// Importé en premier par les points d'entrée (serveur, scripts de base de données) :
// arrête le programme avec un message clair avant de charger better-sqlite3.
import { unsupportedNodeMessage } from "./nodeVersion.ts";

const message = unsupportedNodeMessage();
if (message !== undefined) {
  console.error(message);
  process.exit(1);
}
