// scripts/seed/seedAbsences.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function seedAbsences(companyId: string) {
  const today = new Date().toISOString().split("T")[0];

  await supabase.from("absences").insert([
    {
      company_id: companyId,
      employee_id: 1,
      date: today,
      reason: "Dovolená",
    },
  ]);

  console.log("✓ Absences seeded");
}
