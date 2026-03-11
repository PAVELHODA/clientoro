// PATH: src/components/calendar/ReservationModal.tsx
"use client";
import React, { useState } from "react";
import { useTheme } from "@/theme/ThemeContext"; // OPRAVENÝ IMPORT
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ReservationModal({ startTime, date, employees, services, onClose, onSave }: any) {
  const theme = useTheme();
  const [customerName, setCustomerName] = useState("");

  const handleSave = async () => {
    const { error } = await supabase.from('reservations').insert([{
      start: new Date(date).toISOString(),
      customer_name: customerName,
      status: 'confirmed'
    }]);
    if (!error) { onSave(); onClose(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: theme.colors.surface, padding: "30px", borderRadius: "20px", width: "400px" }}>
        <h2 style={{ marginBottom: "20px", color: theme.colors.text }}>Nová rezervace</h2>
        <input 
          placeholder="Jméno zákazníka" 
          value={customerName} 
          onChange={(e) => setCustomerName(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSave} style={{ flex: 1, padding: "12px", background: theme.colors.primary, color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" }}>Uložit</button>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f1f5f9", border: "none", borderRadius: "10px", cursor: "pointer" }}>Zrušit</button>
        </div>
      </div>
    </div>
  );
}
