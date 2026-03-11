"use client";

import { useAppSettings } from "@/context/AppSettingsContext";

const labels: Record<"cs" | "sk" | "en", string> = {
  cs: "Čeština",
  sk: "Slovenčina",
  en: "English",
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useAppSettings();

  const langs: ("cs" | "sk" | "en")[] = ["cs", "sk", "en"];

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {langs.map((lng) => (
        <button
          key={lng}
          onClick={() => setLanguage(lng)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.1)",
            background: language === lng ? "#111827" : "#fff",
            color: language === lng ? "#fff" : "#111827",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {labels[lng]}
        </button>
      ))}
    </div>
  );
}
