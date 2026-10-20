import { emailAddress } from "./emailAddress.ts";
import { ADMINISTRATOR, STUDENT } from "./seedIds.ts";
import type { AdministratorRow, StudentRow } from "./seedTypes.ts";

// Personnes fictives. La cohorte est l'année d'arrivée, en texte comme dans l'export Gesta.
// Les adresses en .test ne correspondent à aucun domaine réel.

const student = (
  id: number,
  studentNumber: string,
  firstName: string,
  lastName: string,
  cohort: string,
): StudentRow => ({
  id,
  student_number: studentNumber,
  first_name: firstName,
  last_name: lastName,
  email: emailAddress(firstName, lastName, "etu.gesta.test"),
  cohort,
  status: "ACTIVE",
});

export const students: StudentRow[] = [
  student(STUDENT.LUCAS_DUPONT, "2400101", "Lucas", "Dupont", "2024"),
  student(STUDENT.INES_HADDAD, "2400102", "Inès", "Haddad", "2024"),
  student(STUDENT.MATEUSZ_KOWALSKI, "2400103", "Mateusz", "Kowalski", "2024"),
  student(STUDENT.LEA_MERTENS, "2400104", "Léa", "Mertens", "2024"),
  student(STUDENT.YOUSSEF_EL_AMRANI, "2400105", "Youssef", "El Amrani", "2024"),
  student(STUDENT.IOANA_POPESCU, "2400106", "Ioana", "Popescu", "2024"),
  student(STUDENT.AMINATA_DIALLO, "2300107", "Aminata", "Diallo", "2023"),
  student(STUDENT.DMYTRO_KOVALENKO, "2500108", "Dmytro", "Kovalenko", "2025"),
  student(STUDENT.LOUIS_CLAES, "2500109", "Louis", "Claes", "2025"),
];

export const administrators: AdministratorRow[] = [
  {
    id: ADMINISTRATOR.ANNE_LECLERCQ,
    first_name: "Anne",
    last_name: "Leclercq",
    email: "anne.leclercq@gesta.test",
    status: "ACTIVE",
  },
  {
    id: ADMINISTRATOR.PHILIPPE_MOREAU,
    first_name: "Philippe",
    last_name: "Moreau",
    email: "philippe.moreau@gesta.test",
    status: "ACTIVE",
  },
];
