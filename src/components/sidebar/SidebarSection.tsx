// PATH: src/components/sidebar/SidebarSection.tsx
// DESCRIPTION: Sekce sidebaru – kompatibilní s theme systémem.

"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";

export default function SidebarSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        marginBottom: 16,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            color: theme.colors.textSoft,
            paddingLeft: 4,
          }}
        >
          {title}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {children}
      </div>
    </div>
  );
}
