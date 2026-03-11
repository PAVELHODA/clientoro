"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Mode = "SOLO" | "BUSINESS";

export default function SettingsClient() {
  const [mode, setMode] = useState<Mode>("SOLO");

  useEffect(() => {
    async function loadMode() {
      try {
        const res = await fetch("/api/system/mode");
        const data = await res.json();
        if (data?.mode === "SOLO" || data?.mode === "BUSINESS") {
          setMode(data.mode);
        }
      } catch (e) {
        console.error("Failed to load mode", e);
      }
    }
    loadMode();
  }, []);

  const soloSections = [
    { name: "Profil", href: "/admin/settings/profile" },
    { name: "Firma", href: "/admin/settings/company" },
    { name: "Pracovní doba", href: "/admin/settings/work-hours" },
    { name: "Služby", href: "/admin/settings/services" },
    { name: "Notifikace", href: "/admin/settings/notifications" },
  ];

  const businessSections = [
    { name: "Profil", href: "/admin/settings/profile" },
    { name: "Firma", href: "/admin/settings/company" },
    { name: "Zaměstnanci", href: "/admin/settings/employees" },
    { name: "Pracovní doba firmy", href: "/admin/settings/work-hours" },
    { name: "Služby", href: "/admin/settings/services" },
    { name: "Notifikace", href: "/admin/settings/notifications" },
  ];

  const sections = mode === "BUSINESS" ? businessSections : soloSections;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">
        Nastavení {mode === "BUSINESS" ? "firmy" : "účtu"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-5 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <div className="text-lg font-semibold">{item.name}</div>
            <div className="text-gray-500 text-sm mt-1">
              Otevřít sekci {item.name.toLowerCase()}
            </div>
          </Link>
        ))}
      </div>

      <div className="text-xs text-gray-400 mt-10">
        Režim: {mode === "BUSINESS" ? "Firma" : "OSVČ"}
      </div>
    </div>
  );
}
