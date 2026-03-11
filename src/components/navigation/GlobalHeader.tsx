"use client";

import React from "react";
import NavItem from "./NavItem";
import { useTheme } from "@/theme/useTheme";

export default function GlobalHeader() {
  const theme = useTheme();

  return (
    <header
      style={{
        width: "100%",
        height: 60,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.borderSubtle}`,
        gap: 24,
      }}
    >
      <NavItem label="Domů" icon="home" href="/" />
      <NavItem label="Admin" icon="users" href="/admin" />
      <NavItem label="Kalendář" icon="calendar" href="/admin/calendar" />
    </header>
  );
}
