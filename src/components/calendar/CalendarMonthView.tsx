// PATH: src/components/calendar/CalendarMonthView.tsx
"use client";
import React from "react";

export default function CalendarMonthView() {
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "24px", border: "1.5px solid #1e293b" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "#f1f5f9", border: "1.5px solid #f1f5f9", borderRadius: "12px", overflow: "hidden" }}>
        {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map(d => (
          <div key={d} style={{ background: "#f8fafc", padding: "10px", textAlign: "center", fontWeight: 900, fontSize: "12px" }}>{d}</div>
        ))}
        {daysInMonth.map(d => (
          <div key={d} style={{ background: "#fff", minHeight: "100px", padding: "10px", fontSize: "14px", fontWeight: 700 }}>
            {d}
            {d === 2 && <div style={{ marginTop: "5px", height: "6px", width: "6px", borderRadius: "50%", background: "#10b981" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
