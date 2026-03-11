// Path: src/components/ui/PageHeader.tsx
// Description: Unified page header (title + subtitle) for all modes.

import React from 'react';
import { useTheme } from '@/theme/useTheme';

export default function PageHeader({
  title,
  subtitle,
  style,
}: {
  title: string;
  subtitle?: string;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();

  return (
    <div style={{ marginBottom: 20, ...style }}>
      <h1
        style={{
          margin: 0,
          fontSize: theme.typography.fontSizeXl,
          fontWeight: theme.typography.weightSemibold,
          color: theme.colors.textPrimary,
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            margin: '4px 0 0',
            fontSize: theme.typography.fontSizeMd,
            color: theme.colors.textMuted,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
