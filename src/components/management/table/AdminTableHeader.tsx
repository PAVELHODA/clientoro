"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";

export default function AdminTableHeader({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        padding: "12px 16px",
        background: theme.colors.surfaceSoft,
        borderBottom: `1px solid ${theme.colors.borderSubtle}`,
        fontWeight: 600,
        fontSize: "14px",
        color: theme.colors.text,
      }}
    >
      {children}
    </div>
  );
}
