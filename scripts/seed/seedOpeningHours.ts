// scripts/seed/seedOpeningHours.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function seedOpeningHours(companyId: string) {
  await supabase.from("settings").upsert({
    company_id: companyId,
    opening_hours: {
      mon: [
        { start: "08:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
      tue: [{ start: "08:00", end: "17:00" }],
      wed: [{ start: "08:00", end: "17:00" }],
      thu: [{ start: "08:00", end: "17:00" }],
      fri: [{ start: "08:00", end: "15:00" }],
      sat: null,
      sun: null,
    },
  });

  console.log("✓ Opening hours seeded");
}
