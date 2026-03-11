import React from "react";
import { baseTheme } from "@/theme";

export default function BaseLayout({
  sidebar,
  header,
  panel,
  children,
}: {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  panel?: React.ReactNode;
  children: React.ReactNode;
}) {
  const theme = baseTheme;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          width: 240,
          borderRight: `1px solid ${theme.colors.borderSubtle}`,
          background: theme.colors.surface,
          padding: 16,
          overflowY: "auto",
        }}
      >
        {sidebar}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            height: 60,
            borderBottom: `1px solid ${theme.colors.borderSubtle}`,
            background: theme.colors.surface,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          {header}
        </div>

        <div style={{ display: "flex", flex: 1 }}>
          <div
            style={{
              flex: 1,
              padding: 20,
              overflowY: "auto",
            }}
          >
            {children}
          </div>

          {panel && (
            <div
              style={{
                width: 320,
                borderLeft: `1px solid ${theme.colors.borderSubtle}`,
                background: theme.colors.surface,
                padding: 20,
                overflowY: "auto",
              }}
            >
              {panel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
