"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";

export default function HeaderLeft({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useTheme();

  return (
    <div>
      <div style={{ fontSize: "18px", fontWeight: 600, color: theme.colors.text }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: "13px", color: theme.colors.textSoft, marginTop: "2px" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
