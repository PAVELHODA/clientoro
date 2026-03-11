// src/types/openingHours.ts

export type OpeningHoursInterval = {
  start: string; // "08:00"
  end: string;   // "12:00"
};

export type OpeningHours = {
  mon: OpeningHoursInterval[] | null;
  tue: OpeningHoursInterval[] | null;
  wed: OpeningHoursInterval[] | null;
  thu: OpeningHoursInterval[] | null;
  fri: OpeningHoursInterval[] | null;
  sat: OpeningHoursInterval[] | null;
  sun: OpeningHoursInterval[] | null;
};
