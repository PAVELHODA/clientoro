// PATH: src/config/modeHelpers.ts

import { AppMode, AppTier, ModeFeatures, getModeFeatures } from "./modes";

export function hasFeature(
  mode: AppMode,
  tier: AppTier,
  feature: keyof ModeFeatures
): boolean {
  return getModeFeatures(mode, tier)[feature];
}

export function resolveMode(mode: string | undefined): AppMode {
  if (mode === "solo" || mode === "pro") {
    return mode;
  }
  return "solo";
}

export function resolveTier(tier: string | undefined): AppTier {
  if (tier === "standard" || tier === "inspire") {
    return tier;
  }
  return "standard";
}
