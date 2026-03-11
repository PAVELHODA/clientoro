// PATH: src/components/panel/BasePanel.tsx
// DESCRIPTION: Pravý panel – volitelný, theme systém.

"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";

export default function BasePanel({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <div
      style={{
        background: theme.colors.surface,
        borderLeft: `1px solid ${theme.colors.borderSubtle}`,
        padding: 20,
        height: "100%",
        overflowY: "auto",
      }}
    >
      {children}
    </div>
  );
}
