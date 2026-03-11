// PATH: src/components/calendar/CalendarColumn.tsx
"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";
import { CalendarColumnData, CalendarSlotData, CalendarConfig } from "./types";
import { isWithinWorkHours } from "./calendarUtils";
import CalendarSlot from "./CalendarSlot";

export default function CalendarColumn({
  time,
  columns,
  config,
  onSlotClick,
}: {
  time: string;
  columns: CalendarColumnData[];
  config: CalendarConfig;
  onSlotClick?: (slot: CalendarSlotData, columnId: string) => void;
}) {
  const theme = useTheme();
  const isWork = isWithinWorkHours(time, config);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `80px repeat(${columns.length}, 1fr)`,
        borderTop: `1px solid ${theme.colors.borderSubtle}`,
        fontWeight: isWork ? 500 : 400,
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          fontSize: theme.typography.fontSizeSm,
          color: isWork ? theme.colors.text : theme.colors.textMuted,
          display: "flex",
          alignItems: "center",
          fontWeight: isWork ? 600 : 400,
          background: isWork ? "transparent" : "#fafafa",
        }}
      >
        {time}
      </div>

      {columns.map((col) => {
        const slot = col.slots.find((s) => s.time === time);
        return (
          <CalendarSlot
            key={col.id}
            slot={slot}
            isWorkHour={isWork}
            onClick={(s) => onSlotClick?.(s, col.id)}
          />
        );
      })}
    </div>
  );
}
