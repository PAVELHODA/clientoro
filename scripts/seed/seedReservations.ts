// scripts/seed/seedReservations.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function seedReservations(companyId: string) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  await supabase.from("reservations").insert([
    {
      company_id: companyId,
      title: "Stříhání vlasů",
      start: `${today}T09:00:00.000Z`,
      end: `${today}T10:00:00.000Z`,
    },
    {
      company_id: companyId,
      title: "Barvení vlasů",
      start: `${today}T13:00:00.000Z`,
      end: `${today}T15:00:00.000Z`,
    },
  ]);

  console.log("✓ Reservations seeded");
}
