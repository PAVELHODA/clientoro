// PATH: src/components/calendar/types.ts

export type SlotStatus = "free" | "reserved" | "cancelled" | "blocked";

export type ReservationDuration = {
  type: "fixed" | "flexible";
  minutes: number;
  slots: number;
};

// NOVY TYP - dostupnost
export type AvailabilityType =
  | "working"        // normalni pracovni den
  | "half_morning"   // jen dopoledne
  | "half_afternoon" // jen odpoledne
  | "day_off"        // volno
  | "vacation"       // dovolena
  | "blocked"        // blokovany cas
  | "public_holiday" // statni svatek
  | "multi_day_job"; // zakazka pres vice dni

export type AvailabilityBlock = {
  id: string;
  type: AvailabilityType;
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD" (same as startDate for single day)
  startTime?: string;  // "HH:MM" pro puldenni
  endTime?: string;    // "HH:MM" pro puldenni
  label?: string;      // "Dovolena", "Skoleni", "Zakazka Novak"
  employeeId?: string; // pro Pro mod
  color?: string;      // vlastni barva
  repeating?: {
    type: "weekly" | "monthly";
    days?: number[];   // 0=Po, 1=Ut, ..., 6=Ne
  };
};

export type CalendarSlotData = {
  time: string;
  label?: string;
  sublabel?: string;
  status: SlotStatus;
  clientId?: string;
  serviceId?: string;
  price?: number;
  duration?: ReservationDuration;
  employeeName?: string;
  employeeId?: string;
  color?: string;
};

export type CalendarColumnData = {
  id: string;
  title: string;
  slots: CalendarSlotData[];
};

export type CalendarView = "day" | "week" | "month";

export type CalendarConfig = {
  fullDayStart: number;
  fullDayEnd: number;
  workStart: number;
  workEnd: number;
  slotDuration: number;
  supportsMultiSlot: boolean;
  supportsMultiDay: boolean;
};

export const defaultCalendarConfig: CalendarConfig = {
  fullDayStart: 0,
  fullDayEnd: 24,
  workStart: 6,
  workEnd: 22,
  slotDuration: 60,
  supportsMultiSlot: true,
  supportsMultiDay: true,
};

// Barvy pro typy dostupnosti
export const availabilityColors: Record<AvailabilityType, { bg: string; border: string; text: string }> = {
  working:        { bg: "#f0fdf4", border: "#22c55e", text: "#15803d" },
  half_morning:   { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8" },
  half_afternoon: { bg: "#faf5ff", border: "#8b5cf6", text: "#6d28d9" },
  day_off:        { bg: "#f9fafb", border: "#9ca3af", text: "#6b7280" },
  vacation:       { bg: "#fff7ed", border: "#f97316", text: "#c2410c" },
  blocked:        { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
  public_holiday: { bg: "#fef2f2", border: "#dc2626", text: "#dc2626" },
  multi_day_job:  { bg: "#f0f9ff", border: "#0ea5e9", text: "#0369a1" },
};
