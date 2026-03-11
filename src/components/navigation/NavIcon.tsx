// PATH: src/components/navigation/NavIcon.tsx

import React from 'react';
import { useTheme } from '@/theme/useTheme';

export default function NavIcon({ name, active }: { name: string; active: boolean }) {
  const theme = useTheme();
  const color = active ? theme.colors.primary : theme.colors.textSecondary;

  const icons: Record<string, JSX.Element> = {
    home: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2">
        <path d="M3 9l6-6 6 6" />
        <path d="M5 9v6h8V9" />
      </svg>
    ),

    calendar: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2">
        <rect x="2" y="4" width="14" height="12" rx="2" />
        <line x1="2" y1="8" x2="16" y2="8" />
      </svg>
    ),

    users: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2">
        <circle cx="6" cy="7" r="3" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    ),

    services: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2">
        <circle cx="9" cy="9" r="7" />
      </svg>
    ),

    clients: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="4" width="12" height="10" rx="2" />
      </svg>
    ),
  };

  return icons[name] ?? null;
}
