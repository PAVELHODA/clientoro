"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";

export default function BaseHeader({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  const theme = useTheme();

  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: `1px solid ${theme.colors.borderSubtle}`,
        background: theme.colors.surface,
      }}
    >
      <div>{left}</div>
      <div style={{ display: "flex", gap: "16px" }}>{right}</div>
    </header>
  );
}
