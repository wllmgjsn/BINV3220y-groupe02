import { emailAddress } from "./emailAddress.ts";
import { COMPANY, CONTACT } from "./seedIds.ts";
import type { CompanyContactRow, CompanyRow, ContactRole, ContactSeed } from "./seedTypes.ts";

// Toutes les entreprises et personnes sont fictives. Les adresses en .test
// sont réservées et ne correspondent à aucun domaine réel.

const company = (
  id: number,
  name: string,
  shortName: string,
  address: string | null,
  locality: string,
  options: Partial<Pick<CompanyRow, "status" | "parent_company_id">> = {},
): CompanyRow => ({
  id,
  name,
  short_name: shortName,
  address,
  locality,
  status: options.status ?? "ACTIVE",
  parent_company_id: options.parent_company_id ?? null,
});

export const companies: CompanyRow[] = [
  company(COMPANY.LUMEN_GROUP, "Groupe Lumen SA", "Lumen", "Avenue des Lucioles 40", "Bruxelles"),
  company(
    COMPANY.LUMEN_DIGITAL,
    "Lumen Digital SRL",
    "Lumen Digital",
    "Rue du Laboratoire 8",
    "Louvain-la-Neuve",
    { parent_company_id: COMPANY.LUMEN_GROUP },
  ),
  company(
    COMPANY.LUMEN_DATA,
    "Lumen Data Services SRL",
    "Lumen Data",
    "Boulevard de la Meuse 115",
    "Namur",
    { parent_company_id: COMPANY.LUMEN_GROUP },
  ),
  company(COMPANY.ORBIS, "Orbis Software SA", "Orbis", "Quai des Ateliers 21", "Liège"),
  company(COMPANY.BRIKK, "Brikk Studio SRL", "Brikk", "Rue des Briqueteries 3", "Charleroi"),
  company(COMPANY.NEXALIS, "Nexalis SA", "Nexalis", "Parc Initialis 12", "Mons"),
  company(COMPANY.DATAVIA, "Datavia Consulting SRL", "Datavia", "Chaussée des Données 77", "Wavre"),
  company(COMPANY.COBALT, "Cobalt Systems NV", "Cobalt", "Kobaltstraat 5", "Gand"),
  company(COMPANY.HEXAGONE, "Hexagone Conseil SRL", "Hexagone", "Rue des Six Côtés 6", "Bruxelles"),
  company(COMPANY.VERTIGO, "Vertigo Games SRL", "Vertigo", "Place du Jeu 14", "Mons"),
  company(COMPANY.PIXELUNE, "Pixelune SRL", "Pixelune", "Rue de la Lune 9", "Namur"),
  company(COMPANY.ARCHIVIUM, "Archivium SA", "Archivium", "Rue des Registres 2", "Tournai", {
    status: "ARCHIVED",
  }),
  // Créée par une étudiante lors de la déclaration de son stage : à vérifier.
  company(COMPANY.NEBULA, "Studio Nébula", "Nébula", null, "Liège", { status: "TO_VERIFY" }),
];

const contact = (
  id: number,
  firstName: string,
  lastName: string,
  emailDomain: string,
  roles: ContactRole[],
  status: ContactSeed["status"] = "ACTIVE",
): ContactSeed => ({
  id,
  first_name: firstName,
  last_name: lastName,
  email: emailAddress(firstName, lastName, emailDomain),
  phone: null,
  status,
  roles,
});

export const contacts: ContactSeed[] = [
  contact(CONTACT.CLAIRE_DUMONT, "Claire", "Dumont", "lumen-digital.test", ["DEPOSITOR"]),
  contact(CONTACT.MARC_LEJEUNE, "Marc", "Lejeune", "orbis.test", ["DEPOSITOR"]),
  contact(CONTACT.NADIA_CHERIF, "Nadia", "Cherif", "orbis.test", ["PROMOTER", "SIGNATORY"]),
  // Contact multi-entreprises (Lumen Digital et Lumen Data) qui cumule les trois rôles.
  contact(CONTACT.JULIEN_LAMBERT, "Julien", "Lambert", "lumen.test", [
    "DEPOSITOR",
    "PROMOTER",
    "SIGNATORY",
  ]),
  contact(CONTACT.NATHALIE_RENARD, "Nathalie", "Renard", "lumen.test", ["SIGNATORY"]),
  contact(CONTACT.THOMAS_DUBOIS, "Thomas", "Dubois", "lumen-data.test", ["SIGNATORY"]),
  contact(CONTACT.ISABELLE_COLLIN, "Isabelle", "Collin", "brikk.test", ["DEPOSITOR", "PROMOTER"]),
  contact(CONTACT.PIOTR_NOWAK, "Piotr", "Nowak", "nexalis.test", ["DEPOSITOR"]),
  contact(CONTACT.LAURA_SIMON, "Laura", "Simon", "nexalis.test", ["PROMOTER"]),
  contact(CONTACT.ANTOINE_LEROY, "Antoine", "Leroy", "datavia.test", ["DEPOSITOR"]),
  contact(CONTACT.FATOU_NDIAYE, "Fatou", "Ndiaye", "datavia.test", ["PROMOTER", "SIGNATORY"]),
  contact(CONTACT.PIETER_JANSSENS, "Pieter", "Janssens", "cobalt.test", [
    "DEPOSITOR",
    "PROMOTER",
    "SIGNATORY",
  ]),
  contact(CONTACT.CAROLINE_MICHEL, "Caroline", "Michel", "hexagone.test", ["DEPOSITOR"]),
  contact(CONTACT.MEHDI_ALAOUI, "Mehdi", "Alaoui", "hexagone.test", ["PROMOTER"]),
  contact(CONTACT.SARAH_LAMBOTTE, "Sarah", "Lambotte", "vertigo.test", ["DEPOSITOR", "PROMOTER"]),
  contact(CONTACT.OLIVIER_PIRARD, "Olivier", "Pirard", "pixelune.test", ["DEPOSITOR"]),
  contact(CONTACT.ELENA_IVANOVA, "Elena", "Ivanova", "pixelune.test", ["PROMOTER"]),
  contact(CONTACT.BERNARD_PETIT, "Bernard", "Petit", "archivium.test", ["DEPOSITOR"], "INACTIVE"),
  // Contact sans rôle : enregistré, mais ne peut pas se connecter.
  contact(CONTACT.HELENE_VERMEULEN, "Hélène", "Vermeulen", "brikk.test", []),
  // Créé par une étudiante lors de la déclaration de son stage : à vérifier.
  contact(CONTACT.YANN_DELCOURT, "Yann", "Delcourt", "nebula.test", ["PROMOTER"], "TO_VERIFY"),
];

export const companyContacts: CompanyContactRow[] = [
  { company_id: COMPANY.LUMEN_GROUP, contact_id: CONTACT.NATHALIE_RENARD },
  { company_id: COMPANY.LUMEN_DIGITAL, contact_id: CONTACT.CLAIRE_DUMONT },
  { company_id: COMPANY.LUMEN_DIGITAL, contact_id: CONTACT.JULIEN_LAMBERT },
  { company_id: COMPANY.LUMEN_DATA, contact_id: CONTACT.JULIEN_LAMBERT },
  { company_id: COMPANY.LUMEN_DATA, contact_id: CONTACT.THOMAS_DUBOIS },
  { company_id: COMPANY.ORBIS, contact_id: CONTACT.MARC_LEJEUNE },
  { company_id: COMPANY.ORBIS, contact_id: CONTACT.NADIA_CHERIF },
  { company_id: COMPANY.BRIKK, contact_id: CONTACT.ISABELLE_COLLIN },
  { company_id: COMPANY.BRIKK, contact_id: CONTACT.HELENE_VERMEULEN },
  { company_id: COMPANY.NEXALIS, contact_id: CONTACT.PIOTR_NOWAK },
  { company_id: COMPANY.NEXALIS, contact_id: CONTACT.LAURA_SIMON },
  { company_id: COMPANY.DATAVIA, contact_id: CONTACT.ANTOINE_LEROY },
  { company_id: COMPANY.DATAVIA, contact_id: CONTACT.FATOU_NDIAYE },
  { company_id: COMPANY.COBALT, contact_id: CONTACT.PIETER_JANSSENS },
  { company_id: COMPANY.HEXAGONE, contact_id: CONTACT.CAROLINE_MICHEL },
  { company_id: COMPANY.HEXAGONE, contact_id: CONTACT.MEHDI_ALAOUI },
  { company_id: COMPANY.VERTIGO, contact_id: CONTACT.SARAH_LAMBOTTE },
  { company_id: COMPANY.PIXELUNE, contact_id: CONTACT.OLIVIER_PIRARD },
  { company_id: COMPANY.PIXELUNE, contact_id: CONTACT.ELENA_IVANOVA },
  { company_id: COMPANY.ARCHIVIUM, contact_id: CONTACT.BERNARD_PETIT },
  { company_id: COMPANY.NEBULA, contact_id: CONTACT.YANN_DELCOURT },
];
