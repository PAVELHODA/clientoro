// Path: src/components/ui/PanelContainer.tsx
// Description: Unified right-side panel container for all modes.

import React from 'react';
import { useTheme } from '@/theme/useTheme';

export default function PanelContainer({
  children,
  width = 320,
  style,
}: {
  children: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();

  return (
    <aside
      style={{
        width,
        background: theme.colors.surface,
        borderLeft: `1px solid ${theme.colors.borderSubtle}`,
        padding: '16px',
        overflowY: 'auto',
        ...style,
      }}
    >
      {children}
    </aside>
  );
}
