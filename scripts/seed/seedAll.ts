// scripts/seed/seedAll.ts

import { seedOpeningHours } from "./seedOpeningHours";
import { seedReservations } from "./seedReservations";
import { seedEmployees } from "./seedEmployees";
import { seedAbsences } from "./seedAbsences";

const COMPANY_ID = "00000000-0000-0000-0000-000000000000";

async function run() {
  console.log("Seeding test data…");

  await seedOpeningHours(COMPANY_ID);
  await seedEmployees(COMPANY_ID);
  await seedReservations(COMPANY_ID);
  await seedAbsences(COMPANY_ID);

  console.log("✓ All seeds completed");
}

run();
