// PATH: src/components/calendar/CalendarSlot.tsx
"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";
import { CalendarSlotData, SlotStatus } from "./types";
import { useLanguage } from "@/i18n/LanguageContext";

const statusColors: Record<SlotStatus, { bg: string; text: string }> = {
  free: { bg: "transparent", text: "#9ca3af" },
  reserved: { bg: "#dbeafe", text: "#1e40af" },
  cancelled: { bg: "#fee2e2", text: "#dc2626" },
  blocked: { bg: "#f3f4f6", text: "#6b7280" },
};

const freeLabel: Record<string, string> = { cs: "Volno", sk: "Volno", en: "Free" };
const cancelledLabel: Record<string, string> = { cs: "Zruseno", sk: "Zrusene", en: "Cancelled" };
const blockedLabel: Record<string, string> = { cs: "Blokovano", sk: "Blokovane", en: "Blocked" };

export default function CalendarSlot({
  slot,
  isWorkHour,
  onClick,
}: {
  slot?: CalendarSlotData;
  isWorkHour?: boolean;
  onClick?: (slot: CalendarSlotData) => void;
}) {
  const theme = useTheme();
  const { language } = useLanguage();

  const status = slot?.status || "free";
  const colors = statusColors[status];

  const handleClick = () => {
    if (onClick && slot) {
      onClick(slot);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: "8px 12px",
        borderLeft: `1px solid ${theme.colors.borderSubtle}`,
        background: status !== "free"
          ? colors.bg
          : isWorkHour === false
          ? "#f9fafb"
          : theme.colors.surface,
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: 44,
        display: "flex",
        alignItems: "center",
        opacity: isWorkHour === false && status === "free" ? 0.5 : 1,
      }}
    >
      {status === "reserved" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: theme.typography.fontSizeMd,
              fontWeight: theme.typography.weightMedium,
              color: colors.text,
            }}
          >
            {slot?.label}
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSizeSm,
              color: theme.colors.textSecondary,
            }}
          >
            {slot?.sublabel}
            {slot?.price ? ` | ${slot.price} Kc` : ""}
            {slot?.duration ? ` | ${slot.duration.minutes} min` : ""}
          </span>
        </div>
      ) : status === "cancelled" ? (
        <span style={{ fontSize: theme.typography.fontSizeSm, color: colors.text, fontStyle: "italic" }}>
          {cancelledLabel[language]}
        </span>
      ) : status === "blocked" ? (
        <span style={{ fontSize: theme.typography.fontSizeSm, color: colors.text }}>
          {blockedLabel[language]}
        </span>
      ) : (
        <span style={{ fontSize: theme.typography.fontSizeSm, color: colors.text }}>
          {freeLabel[language]}
        </span>
      )}
    </div>
  );
}
