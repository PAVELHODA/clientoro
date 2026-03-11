// PATH: src/config/publicHolidays.ts

export type PublicHoliday = {
  date: string;
  nameCs: string;
  nameSk: string;
  nameEn: string;
  countries: ("cz" | "sk")[];
};

export const fixedHolidays: PublicHoliday[] = [
  { date: "01-01", nameCs: "Novy rok", nameSk: "Novy rok", nameEn: "New Year's Day", countries: ["cz", "sk"] },
  { date: "01-06", nameCs: "Tri kralove", nameSk: "Traja krali", nameEn: "Epiphany", countries: ["sk"] },
  { date: "05-01", nameCs: "Svatek prace", nameSk: "Sviatok prace", nameEn: "Labour Day", countries: ["cz", "sk"] },
  { date: "05-08", nameCs: "Den vitezstvi", nameSk: "Den vitazstva", nameEn: "Victory Day", countries: ["cz"] },
  { date: "07-05", nameCs: "Den Cyrila a Metodeje", nameSk: "Sviatok Cyrila a Metoda", nameEn: "Cyril and Methodius Day", countries: ["cz", "sk"] },
  { date: "07-06", nameCs: "Den upaleni Jana Husa", nameSk: "Den upalenia Jana Husa", nameEn: "Jan Hus Day", countries: ["cz"] },
  { date: "08-29", nameCs: "Vyroci SNP", nameSk: "Vyrocie SNP", nameEn: "Slovak National Uprising", countries: ["sk"] },
  { date: "09-01", nameCs: "Den Ustavy SR", nameSk: "Den Ustavy SR", nameEn: "Slovak Constitution Day", countries: ["sk"] },
  { date: "09-28", nameCs: "Den ceske statnosti", nameSk: "Den ceskej statnosti", nameEn: "Czech Statehood Day", countries: ["cz"] },
  { date: "10-28", nameCs: "Den vzniku Ceskoslovenska", nameSk: "Den vzniku Ceskoslovenska", nameEn: "Czechoslovakia Day", countries: ["cz", "sk"] },
  { date: "11-01", nameCs: "Svatek vsech svatych", nameSk: "Sviatok vsetkych svatych", nameEn: "All Saints Day", countries: ["sk"] },
  { date: "11-17", nameCs: "Den boje za svobodu", nameSk: "Den boja za slobodu", nameEn: "Freedom Day", countries: ["cz", "sk"] },
  { date: "12-24", nameCs: "Stedry den", nameSk: "Stedry den", nameEn: "Christmas Eve", countries: ["cz", "sk"] },
  { date: "12-25", nameCs: "1. svatek vanocni", nameSk: "1. sviatok vianocny", nameEn: "Christmas Day", countries: ["cz", "sk"] },
  { date: "12-26", nameCs: "2. svatek vanocni", nameSk: "2. sviatok vianocny", nameEn: "Boxing Day", countries: ["cz", "sk"] },
];

export function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function getMovableHolidays(year: number): PublicHoliday[] {
  const easter = getEasterDate(year);

  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);

  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return [
    { date: fmt(goodFriday), nameCs: "Velky patek", nameSk: "Velky piatok", nameEn: "Good Friday", countries: ["cz", "sk"] },
    { date: fmt(easterMonday), nameCs: "Velikonocni pondeli", nameSk: "Velkonocny pondelok", nameEn: "Easter Monday", countries: ["cz", "sk"] },
  ];
}

export function getHolidaysForYear(year: number, country: "cz" | "sk"): PublicHoliday[] {
  const fixed = fixedHolidays.filter((h) => h.countries.includes(country));
  const movable = getMovableHolidays(year);
  return [...fixed, ...movable];
}

export function isHoliday(date: Date, country: "cz" | "sk"): PublicHoliday | undefined {
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year, country);
  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const yyyymmdd = `${year}-${mmdd}`;
  return holidays.find((h) => h.date === mmdd || h.date === yyyymmdd);
}

export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
