// PATH: src/components/calendar/calendarUtils.ts
export const SLOT_HEIGHT = 24; // Zúženo z 28px na 24px (Bod 4)

import { CalendarConfig, CalendarSlotData } from "./types";
import { Language } from "@/i18n/translations";

export function generateTimeSlots(config: CalendarConfig): string[] {
  const slots: string[] = [];
  const step = 15;
  for (let h = config.fullDayStart; h < config.fullDayEnd; h++) {
    for (let m = 0; m < 60; m += step) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getDayNames(lang: Language): string[] {
  if (lang === "sk") return ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];
  if (lang === "en") return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
}

export function getMonthNames(lang: Language): string[] {
  if (lang === "sk") return ["Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"];
  if (lang === "en") return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
}

export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function getMonthDates(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) currentWeek.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    currentWeek.push(new Date(year, month, d));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
}

export function formatDate(date: Date, lang: Language): string {
  const dayNames = getDayNames(lang);
  const monthNames = getMonthNames(lang);
  return `${dayNames[(date.getDay() + 6) % 7]} ${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}
