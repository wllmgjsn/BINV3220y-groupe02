// npm run db:init : crée la base si nécessaire, applique les migrations,
// insère les données de démonstration si la base est vide.
import "../../requireSupportedNode.ts";
import { DATABASE_PATH } from "../../config.ts";
import { initializeDatabase } from "../initialize.ts";
import { printSummary } from "./printSummary.ts";

const result = initializeDatabase(DATABASE_PATH);
printSummary(DATABASE_PATH, result);
result.db.close();
