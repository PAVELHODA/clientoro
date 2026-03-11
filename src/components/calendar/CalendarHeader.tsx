// PATH: src/components/calendar/CalendarHeader.tsx
"use client";
import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatDate } from "./calendarUtils";
import { getWeekNumber } from "@/config/publicHolidays"; 
import { getNameDay } from "@/config/namedays";

export default function CalendarHeader({ currentDate, view, onViewChange, onPrev, onNext, onToday, showNamedays, onToggleNamedays }: any) {
  const { language, t } = useLanguage();

  // Bezpečný překlad s fallbackem
  const getTranslation = (key: string) => {
    if (t && t[key]) return t[key];
    return key;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px", marginBottom: "40px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onToggleNamedays} style={{ padding: "10px 20px", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
          {showNamedays ? "🔔 Svátky ON" : "🔕 Svátky OFF"}
        </button>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={onPrev} style={{ padding: "10px 15px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>←</button>
            <button onClick={onToday} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 800, cursor: "pointer" }}>Dnes</button>
            <button onClick={onNext} style={{ padding: "10px 15px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>→</button>
          </div>
          <div style={{ display: "flex", background: "#f1f5f9", padding: "5px", borderRadius: "12px", gap: "5px" }}>
            {['day', 'week', 'month'].map((v) => (
              <button key={v} onClick={() => onViewChange(v)} style={{ padding: "8px 15px", border: "none", borderRadius: "10px", background: view === v ? "#fff" : "transparent", fontWeight: 800, fontSize: "11px", cursor: "pointer", boxShadow: view === v ? "0 2px 5px rgba(0,0,0,0.1)" : "none" }}>
                {getTranslation(v).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "25px" }}>
        <h2 style={{ margin: 0, fontSize: "36px", fontWeight: 900, color: "#1e293b", letterSpacing: "-1px" }}>{formatDate(currentDate, language)}</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ padding: "6px 16px", background: "#1e293b", color: "#fff", borderRadius: "20px", fontSize: "12px", fontWeight: 800 }}>Týden {getWeekNumber(currentDate)}</span>
          {showNamedays && (
            <span style={{ color: "#6366f1", fontWeight: 800, fontSize: "18px" }}>🎉 {getNameDay(currentDate, language)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
