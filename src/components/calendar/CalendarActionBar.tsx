// PATH: src/components/calendar/CalendarActionBar.tsx
"use client";

import React from "react";
import { useMode } from "@/config/ModeContext";
import { businessTemplates } from "@/config/businessTemplates";

export default function CalendarActionBar() {
  const { template } = useMode();
  
  // Najdeme šablonu podle aktuálního nastavení
  const currentTemplate = businessTemplates.find(t => t.id === template?.id) || businessTemplates[0];

  return (
    <div style={{
      marginTop: "20px", padding: "16px", background: "#f8fafc",
      borderRadius: "20px", border: "1px solid #e2e8f0",
      display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap"
    }}>
      {currentTemplate.actions.map((action, i) => (
        <button key={i} style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px",
          background: "#fff", border: "1px solid #cbd5e1", borderRadius: "12px",
          cursor: "pointer", fontSize: "13px", fontWeight: 700, transition: "0.2s"
        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6366f1"}>
          <span>{action.icon}</span> {action.label}
        </button>
      ))}
    </div>
  );
}
