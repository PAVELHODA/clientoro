// PATH: src/components/admin/AdminShell.tsx
"use client";

import Sidebar from "./Sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-6 bg-bg text-sidebar-text">
        {children}
      </div>
    </div>
  );
}
