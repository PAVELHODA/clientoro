// PATH: src/components/sidebar/AppSidebar.tsx
"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMode } from "@/config/ModeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { sidebarConfig } from "@/config/modes";
import * as LucideIcons from "lucide-react";

export default function AppSidebar() {
  const { mode, setMode, useAi, setUseAi } = useMode();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const styles: any = {
    "osvc": { bg: "linear-gradient(180deg, #065f46 0%, #022c22 100%)", accent: "#34d399", name: "OSVČ" },
    "firma": { bg: "linear-gradient(180deg, #075985 0%, #172554 100%)", accent: "#38bdf8", name: "FIRMA" },
    "solo-inspire": { bg: "linear-gradient(180deg, #ca8a04 0%, #713f12 100%)", accent: "#fef3c7", name: "SOLO INSPIRE" },
    "pro-inspire": { bg: "linear-gradient(180deg, #ca8a04 0%, #451a03 100%)", accent: "#fff7ed", name: "PRO INSPIRE" }
  };

  const d = styles[mode] || styles["osvc"];
  const items = sidebarConfig[mode] || sidebarConfig["osvc"];

  // Funkce pro bezpečný překlad položky menu
  const getTranslatedLabel = (label: string) => {
    const key = label.toLowerCase().replace(/\s+/g, '_');
    return t[key] || label;
  };

  return (
    <aside style={{ 
      width: "260px", height: "100vh", background: d.bg, position: "fixed", 
      left: 0, top: 0, color: "#fff", display: "flex", flexDirection: "column", 
      zIndex: 1000, overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      
      <div style={{ padding: "35px 25px 10px 25px", flexShrink: 0 }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, letterSpacing: "5px" }}>INSPIRE</h1>
        <div style={{ fontSize: "9px", fontWeight: 700, color: d.accent, marginTop: "6px", letterSpacing: "2px" }}>
          {t.status}: {d.name}
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "15px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {items.map((item: any, i: number) => {
            const Icon = (LucideIcons as any)[item.i];
            const isActive = pathname === item.p;
            return (
              <div key={i} onClick={() => router.push(item.p)} style={{ 
                display: "flex", alignItems: "center", gap: "12px", padding: "10px 15px", 
                borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600,
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                transition: "0.2s"
              }}>
                {Icon && <Icon size={18} strokeWidth={2.5} />} 
                {getTranslatedLabel(item.l)}
              </div>
            );
          })}
        </div>
      </nav>

      <div style={{ padding: "20px 15px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
        
        {/* AI Tlačítko s překladem */}
        <div onClick={() => setUseAi(!useAi)} style={{ 
          display: "flex", justifyContent: "center", padding: "10px", borderRadius: "12px", 
          background: useAi ? d.accent : "rgba(255,255,255,0.1)", 
          color: useAi ? "#000" : "#fff", cursor: "pointer", marginBottom: "15px", fontSize: "10px", fontWeight: 800, textAlign: "center"
        }}>
          {useAi ? t.ai_active : t.ai_off}
        </div>
        
        {/* Jazyky */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "10px" }}>
          {['cs', 'sk', 'en'].map(l => (
            <button key={l} onClick={() => setLanguage(l)} style={{ 
              flex: 1, padding: "8px", borderRadius: "8px", border: "none", fontSize: "10px", fontWeight: 900,
              background: language === l ? "#fff" : "transparent", color: language === l ? "#000" : "#fff", cursor: "pointer"
            }}>{l.toUpperCase()}</button>
          ))}
        </div>

        {/* Výběr módu - Přeložené názvy */}
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ 
          width: "100%", padding: "10px", borderRadius: "10px", background: "#fff", 
          color: "#000", border: "none", fontSize: "12px", fontWeight: 800, cursor: "pointer" 
        }}>
          <option value="osvc">{t.osvc || "OSVČ"}</option>
          <option value="firma">{t.firma || "FIRMA"}</option>
          <option value="solo-inspire">SOLO INSPIRE</option>
          <option value="pro-inspire">PRO INSPIRE</option>
        </select>
      </div>
    </aside>
  );
}
