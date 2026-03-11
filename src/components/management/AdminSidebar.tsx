"use client";

import SidebarBase from "@/components/ui/SidebarBase";
import { adminSidebarTheme } from "@/theme/sidebarThemes";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  User,
  Settings,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Kalendář", icon: Calendar },
  { href: "/admin/employees", label: "Zaměstnanci", icon: Users },
  { href: "/admin/services", label: "Služby", icon: Scissors },
  { href: "/admin/clients", label: "Klienti", icon: User },
  { href: "/admin/settings", label: "Nastavení", icon: Settings },
];

export default function AdminSidebar() {
  return (
    <SidebarBase
      items={items}
      theme={adminSidebarTheme}
      footer={
        <>
          {/* Jazyk */}
          <select
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              background: "white",
              fontSize: 14,
            }}
          >
            <option value="cs">Čeština</option>
            <option value="en">English</option>
          </select>

          {/* Mód */}
          <select
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              background: "white",
              fontSize: 14,
            }}
          >
            <option value="solo">SOLO</option>
            <option value="business">BUSINESS</option>
            <option value="inspire">INSPIRE</option>
            <option value="sunset">SUNSET</option>
          </select>
        </>
      }
    />
  );
}
