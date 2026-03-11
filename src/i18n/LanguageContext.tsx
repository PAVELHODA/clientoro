// PATH: src/i18n/LanguageContext.tsx
"use client";
import React, { createContext, useContext, useState, useMemo } from "react";
import { translations } from "./translations";

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("cs");
  
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: translations[language] || translations.cs
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
