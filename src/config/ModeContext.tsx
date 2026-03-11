// PATH: src/config/ModeContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const ModeContext = createContext<any>(null);

export function ModeProvider({ children, initialMode = "solo" }: any) {
  const [mode, setMode] = useState(initialMode);
  const [useAi, setUseAi] = useState(true);
  const [template, setTemplate] = useState(null);

  // Vynucení změny módu v celém stromu komponent
  const handleSetMode = (newMode: string) => {
    console.log("Měníme mód na:", newMode);
    setMode(newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: handleSetMode, useAi, setUseAi, template, setTemplate }}>
      {children}
    </ModeContext.Provider>
  );
}

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) throw new Error("useMode must be used within ModeProvider");
  return context;
};
