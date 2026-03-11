// PATH: src/components/growth/GrowthProgress.tsx
"use client";

import React from "react";
import { useTheme } from "@/theme/useTheme";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  GrowthStep,
  getStepName,
  getStepDescription,
  getTierLabel,
  getTierColor,
} from "@/config/growthSteps";

export default function GrowthProgress({
  steps,
  completedKeys,
  currentTier,
}: {
  steps: GrowthStep[];
  completedKeys: Set<string>;
  currentTier: "free" | "plus" | "inspire";
}) {
  const theme = useTheme();
  const { language } = useLanguage();

  const completedCount = steps.filter((s) => completedKeys.has(s.checkKey)).length;
  const totalCount = steps.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const nextStep = steps.find((s) => !completedKeys.has(s.checkKey));

  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.borderSubtle}`,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🚀</span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Tvůj růst ({percentage}%)</span>
        </div>
        <span style={{ fontSize: 13, color: theme.colors.textMuted }}>
          {completedCount}/{totalCount} hotovo
        </span>
      </div>

      <div style={{ width: "100%", height: 10, borderRadius: 5, background: "#eee", overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: "#22c55e", transition: "width 0.5s ease" }} />
      </div>

      {nextStep && (
        <div style={{
          padding: 14,
          borderRadius: 10,
          background: getTierColor(nextStep.tier).bg,
          border: `1px solid ${getTierColor(nextStep.tier).border}30`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Příští krok: {getStepName(nextStep, language)}</div>
            <div style={{ fontSize: 11, color: theme.colors.textMuted }}>{getStepDescription(nextStep, language)}</div>
          </div>
          <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: getTierColor(nextStep.tier).border, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Začít →
          </button>
        </div>
      )}
    </div>
  );
}
