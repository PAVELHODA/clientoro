"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/theme/useTheme";

export default function SidebarItem({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon?: string;
}) {
  const pathname = usePathname();
  const theme = useTheme();

  const active = pathname === href;

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: theme.radius.md,
        background: active ? theme.colors.primarySoft : "transparent",
        color: active ? theme.colors.primary : theme.colors.textSecondary,
        fontWeight: active ? theme.typography.weightSemibold : 400,
        textDecoration: "none",
        transition: "0.15s background",
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
