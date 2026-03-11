// scripts/seed/seedEmployees.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function seedEmployees(companyId: string) {
  await supabase.from("employees").insert([
    { company_id: companyId, name: "Petr" },
    { company_id: companyId, name: "Jana" },
  ]);

  console.log("✓ Employees seeded");
}
