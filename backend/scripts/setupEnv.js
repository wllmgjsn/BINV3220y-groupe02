// npm run setup : crée backend/.env à partir de .env.example avec un JWT_SECRET aléatoire.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

if (existsSync(".env")) {
  console.log("backend/.env existe déjà : conservé.");
} else {
  const secret = randomBytes(32).toString("hex");
  const content = readFileSync(".env.example", "utf8").replace(
    /^JWT_SECRET=.*$/m,
    `JWT_SECRET=${secret}`,
  );
  writeFileSync(".env", content);
  console.log("backend/.env créé avec un JWT_SECRET aléatoire.");
}
