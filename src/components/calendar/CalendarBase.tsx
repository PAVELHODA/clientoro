// PATH: src/components/calendar/CalendarBase.tsx
"use client";

import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CalendarBase({ mode, slots = [], config }: any) {
  const { t, language } = useLanguage();
  const [view, setView] = useState("day");

  const formatDate = (date: Date) => {
    const locales: any = { cs: 'cs-CZ', sk: 'sk-SK', en: 'en-US' };
    return date.toLocaleDateString(locales[language] || 'cs-CZ', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'absence': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'free': return '#f0fdf4';
      default: return '#e2e8f0';
    }
  };

  // DENNÍ POHLED s mřížkou
  const DayView = () => {
    const hours = Array.from({ length: (config.fullDayEnd - config.fullDayStart) + 1 }, (_, i) => config.fullDayStart + i);
    
    return (
      <div style={{ display: "flex", gap: "20px", background: "#fff", padding: "20px", borderRadius: "24px", border: "1.5px solid #1e293b" }}>
        {/* Časová osa */}
        <div style={{ width: "50px" }}>
          {hours.map(h => (
            <div key={h} style={{ height: "60px", fontSize: "12px", fontWeight: 800, color: "#94a3b8", display: "flex", alignItems: "start" }}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Mřížka a Sloty */}
        <div style={{ flex: 1, position: "relative", borderLeft: "1px solid #e2e8f0" }}>
          {/* Vodorovné linky */}
          {hours.map(h => (
            <div key={h} style={{ height: "60px", borderBottom: "1px solid #f1f5f9", width: "100%" }} />
          ))}

          {/* Barevné bloky */}
          {slots.map((slot: any, i: number) => {
            const startHour = parseInt(slot.time.split(':')[0]);
            const topOffset = (startHour - config.fullDayStart) * 60;
            
            return (
              <div key={i} style={{
                position: "absolute",
                top: `${topOffset}px`,
                left: "10px",
                right: "10px",
                height: "58px",
                background: getStatusColor(slot.status),
                borderRadius: "12px",
                borderLeft: `5px solid ${getStatusColor(slot.status)}`,
                padding: "10px",
                color: slot.status === 'free' ? "#166534" : "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                cursor: "pointer",
                filter: slot.status === 'free' ? "none" : "brightness(0.95)"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 900 }}>{slot.label}</div>
                <div style={{ fontSize: "10px", opacity: 0.8 }}>{slot.time} - {slot.service || "Služba"}</div>
              </div>
            );
          })}
        </div>

        {/* Poznámky */}
        <div style={{ width: "200px", padding: "15px", background: "#fefce8", borderRadius: "16px", border: "1px solid #fef08a" }}>
          <div style={{ fontSize: "10px", fontWeight: 900, color: "#854d0e", marginBottom: "10px" }}>{t.notes_title}</div>
          <textarea style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", fontSize: "12px", resize: "none" }} placeholder={t.notes_placeholder} />
        </div>
      </div>
    );
  };

  // TÝDENNÍ POHLED
  const WeekView = () => (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "24px", border: "1.5px solid #1e293b" }}>
      <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", minWidth: "800px" }}>
        <div />
        {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map(day => (
          <div key={day} style={{ textAlign: "center", padding: "10px", fontWeight: 900, borderBottom: "2px solid #f1f5f9" }}>{day}</div>
        ))}
        {Array.from({ length: 14 }, (_, i) => i + 8).map(h => (
          <React.Fragment key={h}>
            <div style={{ height: "40px", fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", fontWeight: 700 }}>{h}:00</div>
            {Array.from({ length: 7 }, (_, d) => (
              <div key={d} style={{ borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", height: "40px" }} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // MĚSÍČNÍ POHLED
  const MonthView = () => (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "24px", border: "1.5px solid #1e293b" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "#f1f5f9", border: "1.5px solid #f1f5f9", borderRadius: "12px", overflow: "hidden" }}>
        {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map(d => (
          <div key={d} style={{ background: "#f8fafc", padding: "10px", textAlign: "center", fontWeight: 900, fontSize: "12px" }}>{d}</div>
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
          <div key={d} style={{ background: "#fff", minHeight: "100px", padding: "10px", fontSize: "14px", fontWeight: 700 }}>
            {d}
            {d === 2 && <div style={{ marginTop: "5px", height: "6px", width: "6px", borderRadius: "50%", background: "#10b981" }} />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {/* HLAVIČKA */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        background: "#fff", padding: "15px 25px", borderRadius: "18px", border: "1.5px solid #e2e8f0" 
      }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 900, margin: 0, textTransform: "capitalize" }}>
            {formatDate(new Date())}
          </h2>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>{t.week_label} 10</div>
        </div>
        
        <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "12px", gap: "2px" }}>
          {['day', 'week', 'month'].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ 
              padding: "8px 16px", border: "none", borderRadius: "8px", fontSize: "11px", fontWeight: 800,
              background: view === v ? "#fff" : "transparent",
              boxShadow: view === v ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              color: view === v ? "#1e293b" : "#64748b", cursor: "pointer", transition: "0.2s"
            }}>
              {t[v]?.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ZOBRAZENÍ */}
      <div style={{ minHeight: "600px" }}>
        {view === "day" && <DayView />}
        {view === "week" && <WeekView />}
        {view === "month" && <MonthView />}
      </div>
    </div>
  );
}
