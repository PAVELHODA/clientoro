// PATH: src/components/calendar/AvailabilityModal.tsx
"use client";

import React, { useState } from "react";
import { useTheme } from "@/theme/useTheme";
import { AvailabilityType, AvailabilityBlock, availabilityColors } from "./types";

const availabilityOptions: { type: AvailabilityType; icon: string; labelCs: string; labelSk: string; labelEn: string }[] = [
  { type: "working",        icon: "✅", labelCs: "Pracovni den",      labelSk: "Pracovny den",     labelEn: "Working day" },
  { type: "half_morning",   icon: "🌅", labelCs: "Jen dopoledne",     labelSk: "Len dopoludnia",   labelEn: "Morning only" },
  { type: "half_afternoon", icon: "🌇", labelCs: "Jen odpoledne",     labelSk: "Len popoludni",    labelEn: "Afternoon only" },
  { type: "day_off",        icon: "📅", labelCs: "Volno",             labelSk: "Volno",            labelEn: "Day off" },
  { type: "vacation",       icon: "🏖️", labelCs: "Dovolena",          labelSk: "Dovolenka",        labelEn: "Vacation" },
  { type: "blocked",        icon: "🔒", labelCs: "Blokovany cas",     labelSk: "Blokovany cas",    labelEn: "Blocked time" },
  { type: "multi_day_job",  icon: "🔧", labelCs: "Zakazka vice dni",  labelSk: "Zakazka viac dni", labelEn: "Multi-day job" },
];

export default function AvailabilityModal({
  startDate,
  endDate,
  employeeId,
  employees,
  language,
  onSave,
  onClose,
}: {
  startDate: string;
  endDate?: string;
  employeeId?: string;
  employees?: { id: string; name: string }[];
  language: string;
  onSave: (block: AvailabilityBlock) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [type, setType] = useState<AvailabilityType>("day_off");
  const [label, setLabel] = useState("");
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate || startDate);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [selectedEmployee, setSelectedEmployee] = useState(employeeId || "all");
  const [repeating, setRepeating] = useState(false);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);

  const dayLabels = language === "sk"
    ? ["Po", "Ut", "St", "St", "Pi", "So", "Ne"]
    : language === "en"
    ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
    : ["Po", "Ut", "St", "Ct", "Pa", "So", "Ne"];

  const colors = availabilityColors[type];
  const isHalfDay = type === "half_morning" || type === "half_afternoon";
  const isMultiDay = type === "vacation" || type === "multi_day_job";

  const handleSave = () => {
    const block: AvailabilityBlock = {
      id: `block_${Date.now()}`,
      type,
      startDate: start,
      endDate: isMultiDay ? end : start,
      label: label || availabilityOptions.find(o => o.type === type)?.labelCs || type,
      employeeId: selectedEmployee === "all" ? undefined : selectedEmployee,
      color: colors.border,
      ...(isHalfDay && { startTime, endTime }),
      ...(repeating && { repeating: { type: "weekly", days: repeatDays } }),
    };
    onSave(block);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.colors.surface,
          borderRadius: 16,
          padding: 28,
          width: 480,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Nastavit dostupnost
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: theme.colors.textMuted }}
          >
            ×
          </button>
        </div>

        {/* Typ bloku */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textMuted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            Typ
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {availabilityOptions.map((opt) => {
              const active = type === opt.type;
              const c = availabilityColors[opt.type];
              return (
                <div
                  key={opt.type}
                  onClick={() => setType(opt.type)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1px solid ${active ? c.border : theme.colors.borderSubtle}`,
                    background: active ? c.bg : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? c.text : theme.colors.text,
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{opt.icon}</span>
                  <span>{language === "sk" ? opt.labelSk : language === "en" ? opt.labelEn : opt.labelCs}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Datum */}
        <div style={{ display: "grid", gridTemplateColumns: isMultiDay ? "1fr 1fr" : "1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              {isMultiDay ? "Od" : "Datum"}
            </label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.colors.borderSubtle}`,
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>
          {isMultiDay && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Do
              </label>
              <input
                type="date"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}
        </div>

        {/* Cas pro puldenni */}
        {isHalfDay && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Od
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Do
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        )}

        {/* Popis */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            Popis (volitelne)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Napr. Dovolena v Chorvatsku, Zakazka Novak..."
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${theme.colors.borderSubtle}`,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Zamestnanec (Pro mod) */}
        {employees && employees.length > 0 && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              Pro koho
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.colors.borderSubtle}`,
                fontSize: 13,
                boxSizing: "border-box",
              }}
            >
              <option value="all">Vsichni</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Opakovani */}
        <div>
          <div
            onClick={() => setRepeating(!repeating)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                border: `2px solid ${repeating ? theme.colors.primary : theme.colors.borderSubtle}`,
                background: repeating ? theme.colors.primary : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
            >
              {repeating && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Opakovat tydenně</span>
          </div>

          {repeating && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {dayLabels.map((day, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setRepeatDays(prev =>
                      prev.includes(i)
                        ? prev.filter(d => d !== i)
                        : [...prev, i]
                    );
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `1px solid ${repeatDays.includes(i) ? theme.colors.primary : theme.colors.borderSubtle}`,
                    background: repeatDays.includes(i) ? theme.colors.primarySoft : "transparent",
                    color: repeatDays.includes(i) ? theme.colors.primary : theme.colors.textMuted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tlacitka */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: `1px solid ${theme.colors.borderSubtle}`,
              background: "transparent",
              fontSize: 13,
              cursor: "pointer",
              color: theme.colors.text,
            }}
          >
            Zrusit
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: colors.border,
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Ulozit
          </button>
        </div>
      </div>
    </div>
  );
}
