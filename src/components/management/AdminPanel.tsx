// PATH: src/app/admin/components/AdminPanel.tsx

"use client";

import React from "react";
import { baseTheme } from "@/theme";

export default function AdminPanel({ children }: { children: React.ReactNode }) {
  const theme = baseTheme; // 🔥 FIX – žádný useTheme()

  return (
    <div
      style={{
        background: theme.colors.panel,
        borderRadius: theme.components.panel.radius,
        border: `1px solid ${theme.colors.textSecondary}`,
        padding: "24px",
      }}
    >
      {children}
    </div>
  );
}
