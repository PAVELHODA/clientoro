// PATH: src/context/AppSettingsContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AppSettings = {
  companyName: string;
  theme: "light" | "dark";
};

type AppSettingsContextType = {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    companyName: "Rezervační systém",
    theme: "light",
  });

  useEffect(() => {
    const saved = localStorage.getItem("app-settings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
  }, [settings]);

  return (
    <AppSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return ctx;
}
