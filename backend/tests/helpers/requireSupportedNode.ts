// Chargé avant chaque fichier de test : un Node trop ancien donne un message clair
// au lieu d'un plantage de better-sqlite3.
import { unsupportedNodeMessage } from "../../src/nodeVersion.ts";

const message = unsupportedNodeMessage();
if (message !== undefined) {
  throw new Error(message);
}
