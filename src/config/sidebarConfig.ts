// PATH: src/config/sidebarConfig.ts

import { AppMode, AppTier, getModeFeatures } from "./modes";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  User,
  Settings,
  CalendarOff,
  ClipboardList,
  BarChart3,
  Building2,
  Store,
  Handshake,
  Megaphone,
  GraduationCap,
  UsersRound,
  Bot,
} from "lucide-react";

export type SidebarItemConfig = {
  key: string;
  icon: React.ComponentType<{ size?: number }>;
  href: (mode: AppMode) => string;
};

const allItems: Record<string, SidebarItemConfig> = {
  dashboard:   { key: "dashboard",   icon: LayoutDashboard, href: (m) => `/${m}/dashboard` },
  calendar:    { key: "calendar",    icon: Calendar,        href: (m) => `/${m}/calendar` },
  clients:     { key: "clients",     icon: User,            href: (m) => `/${m}/clients` },
  services:    { key: "services",    icon: Scissors,        href: (m) => `/${m}/services` },
  employees:   { key: "employees",   icon: Users,           href: (m) => `/${m}/employees` },
  absences:    { key: "absences",    icon: CalendarOff,     href: (m) => `/${m}/absences` },
  orders:      { key: "orders",      icon: ClipboardList,   href: (m) => `/${m}/orders` },
  analytics:   { key: "analytics",   icon: BarChart3,       href: (m) => `/${m}/analytics` },
  barter:      { key: "barter",      icon: Handshake,       href: (m) => `/${m}/barter` },
  listings:    { key: "listings",    icon: Megaphone,       href: (m) => `/${m}/listings` },
  branches:    { key: "branches",    icon: Building2,       href: (m) => `/${m}/branches` },
  marketplace: { key: "marketplace", icon: Store,           href: (m) => `/${m}/marketplace` },
  community:   { key: "community",   icon: UsersRound,      href: (m) => `/${m}/community` },
  academy:     { key: "academy",     icon: GraduationCap,   href: (m) => `/${m}/academy` },
  aiAssistant: { key: "aiAssistant", icon: Bot,             href: (m) => `/${m}/ai-assistant` },
  settings:    { key: "settings",    icon: Settings,        href: (m) => `/${m}/settings` },
};

export function getSidebarItems(mode: AppMode, tier: AppTier): SidebarItemConfig[] {
  const features = getModeFeatures(mode, tier);

  const items: SidebarItemConfig[] = [
    allItems.dashboard,
    allItems.calendar,
    allItems.clients,
    allItems.services,
  ];

  if (features.employees)           items.push(allItems.employees);
  if (features.absences)            items.push(allItems.absences);
  if (features.orders)              items.push(allItems.orders);
  if (features.analytics)           items.push(allItems.analytics);
  if (features.barter)              items.push(allItems.barter);
  if (features.listings)            items.push(allItems.listings);
  if (features.multiBranch)         items.push(allItems.branches);
  if (features.marketplacePriority) items.push(allItems.marketplace);
  if (features.aiAssistant)         items.push(allItems.aiAssistant);
  if (features.community)           items.push(allItems.community);
  if (features.academy)             items.push(allItems.academy);

  items.push(allItems.settings);

  return items;
}
