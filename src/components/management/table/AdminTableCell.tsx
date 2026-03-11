"use client";

import React from "react";

export default function AdminTableCell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {children}
    </div>
  );
}
