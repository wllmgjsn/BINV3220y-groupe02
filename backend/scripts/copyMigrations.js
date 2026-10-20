// tsc ne copie pas les fichiers .sql : on les place à côté du code compilé.
import { cpSync } from "node:fs";

cpSync("src/db/migrations", "dist/db/migrations", { recursive: true });
