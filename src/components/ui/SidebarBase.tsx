"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

export type SidebarTheme = {
  bg: string;
  text: string;
  textActive: string;
  activeBg: string;
  hoverBg: string;
  radius: number;
  border: string;
};

type Props = {
  items: SidebarItem[];
  theme: SidebarTheme;
  footer?: React.ReactNode;
};

export default function SidebarBase({ items, theme, footer }: Props) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        background: theme.bg,
        color: theme.text,
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                color: active ? theme.textActive : theme.text,
                background: active ? theme.activeBg : "transparent",
                borderRadius: theme.radius,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: active ? 600 : 400,
                transition: "0.15s background",
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {footer && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: 20,
            borderTop: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
