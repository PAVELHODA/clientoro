// path: src/hooks/useThemeMode.ts

import { useEffect, useState } from "react";
import type { AppMode } from "@/theme/theme";

export function useThemeMode() {
  const [mode, setMode] = useState<AppMode>("solo");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const m = data?.mode === "business" ? "business" : "solo";
        setMode(m);
      });
  }, []);

  return mode;
}
