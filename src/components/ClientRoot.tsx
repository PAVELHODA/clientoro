"use client";

import { usePathname } from "next/navigation";
import React from "react";
import GlobalHeader from "./navigation/GlobalHeader";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <GlobalHeader />}
      {children}
    </>
  );
}
