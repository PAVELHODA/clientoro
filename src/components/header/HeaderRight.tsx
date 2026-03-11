"use client";

import React from "react";

export default function HeaderRight({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>{children}</div>;
}
