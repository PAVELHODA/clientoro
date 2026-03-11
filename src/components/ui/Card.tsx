// Path: src/components/ui/Card.tsx
// Description: Unified card container for all modes.

import React from 'react';
import { useTheme } from '@/theme/useTheme';

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();

  return (
    <div
      style={{
        borderRadius: theme.components.card.radius,
        padding: theme.components.card.padding,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.borderSubtle}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
