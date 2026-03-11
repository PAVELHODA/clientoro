// PATH: src/components/admin/table/AdminTable.tsx

"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";

export default function AdminTable({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <div
      style={{
        width: "100%",
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.borderSubtle}`,
        borderRadius: theme.radius.md, // opraveno
        padding: "16px",
      }}
    >
      {children}
    </div>
  );
}
