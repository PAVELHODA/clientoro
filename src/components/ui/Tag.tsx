// Path: src/components/ui/Tag.tsx
// Description: Unified tag/badge component for all modes.

import React from 'react';
import { useTheme } from '@/theme/useTheme';

export default function Tag({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();

  return (
    <span
      style={{
        display: 'inline-block',
        padding: `${theme.components.tag.paddingY} ${theme.components.tag.paddingX}`,
        borderRadius: theme.components.tag.radius,
        fontSize: theme.components.tag.fontSize,
        background: theme.colors.primarySoft,
        color: theme.colors.primary,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
