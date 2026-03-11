// PATH: src/components/header/BaseHeader.tsx

"use client";

import React from "react";
import { baseTheme } from "@/theme";

interface BaseHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export default function BaseHeader({ title, children }: BaseHeaderProps) {
  const theme = baseTheme;

  return (
    <header
      style={{
        width: "100%",
        height: theme.layout?.headerHeight ?? 60,
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing?.md ?? 12,
        borderRadius: theme.radius?.md ?? "8px",
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.size?.lg ?? "16px",
        fontWeight: theme.typography?.weight?.medium ?? 500,
      }}
    >
      <div>{title}</div>
      <div>{children}</div>
    </header>
  );
}
