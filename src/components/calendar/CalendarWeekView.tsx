// PATH: src/components/calendar/CalendarWeekView.tsx
"use client";
import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CalendarWeekView({ slots = [], config }: any) {
  const { t } = useLanguage();
  const days = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
  const hours = Array.from({ length: config.fullDayEnd - config.fullDayStart + 1 }, (_, i) => config.fullDayStart + i);

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "24px", border: "1.5px solid #1e293b", overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", minWidth: "800px" }}>
        {/* Header dní */}
        <div />
        {days.map(day => (
          <div key={day} style={{ textAlign: "center", padding: "10px", fontWeight: 900, borderBottom: "2px solid #f1f5f9" }}>{day}</div>
        ))}

        {/* Mřížka hodin */}
        {hours.map(h => (
          <React.Fragment key={h}>
            <div style={{ height: "40px", fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", fontWeight: 700 }}>
              {h}:00
            </div>
            {days.map(day => (
              <div key={day} style={{ borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", height: "40px" }} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
