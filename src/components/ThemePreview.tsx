"use client";

import React from "react";

const themes = [
  { id: 1, name: "Deep Ocean Palm", color: "#0a3d62" },
  { id: 2, name: "Healing Jungle", color: "#1e5631" },
  { id: 3, name: "Ocean-Green Fusion", color: "#2d6a4f" },
  { id: 4, name: "Caribbean Sand", color: "#f4e7d0" },
  { id: 5, name: "Corporate Steel", color: "#f2f4f7" },
  { id: 6, name: "Executive Graphite", color: "#1a1a1a" },
  { id: 7, name: "Copi Sunset Glow", color: "#fde6d8" },
  { id: 8, name: "Bistro Copper Warm", color: "#f3e3d3" },
  { id: 9, name: "Workshop Steel Rust", color: "#e5e5e5" },
  { id: 10, name: "Rustic Oak & Fire", color: "#3b2a1f" },
  { id: 11, name: "Concrete Blueprint", color: "#d9d9d9" },
];

export default function ThemePreview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {themes.map((theme) => (
        <div
          key={theme.id}
          className="rounded shadow p-4 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition"
          style={{ backgroundColor: theme.color, height: 120 }}
        >
          <span
            className="text-sm font-semibold"
            style={{
              color: theme.id === 6 || theme.id === 10 ? "#f1f1f1" : "#333",
            }}
          >
            {theme.name}
          </span>
        </div>
      ))}
    </div>
  );
}
