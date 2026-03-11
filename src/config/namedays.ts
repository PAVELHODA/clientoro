// PATH: src/config/namedays.ts

export const getNameDay = (date: Date, lang: string): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const key = `${day}.${month}.`;

  const names: Record<string, { cz: string, sk: string }> = {
    "1.1.": { cz: "Nový rok", sk: "Nový rok" },
    "24.2.": { cz: "Matěj", sk: "Matej" },
    "25.2.": { cz: "Liliana", sk: "Frederik" },
    "26.2.": { cz: "Dorota", sk: "Viktor" },
    "27.2.": { cz: "Alexandr", sk: "Alexander" },
    "28.2.": { cz: "Lumír", sk: "Zlatica" },
    "1.3.": { cz: "Bedřich", sk: "Albín" },
    "2.3.": { cz: "Anežka", sk: "Anežka" },
    "3.3.": { cz: "Kamil", sk: "Bohumil" },
  };

  if (!names[key]) return "";
  return lang === "sk" ? names[key].sk : names[key].cz;
};
