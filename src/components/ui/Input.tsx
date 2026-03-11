// Path: src/components/ui/Input.tsx
// Description: Unified input component for all modes.

import React from 'react';
import { useTheme } from '@/theme/useTheme';

type InputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
};

export default function Input({ value, onChange, placeholder, style }: InputProps) {
  const theme = useTheme();

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        height: 40,
        padding: '0 12px',
        borderRadius: theme.components.input.radius,
        background: theme.components.input.background,
        border: `1px solid ${theme.components.input.borderColor}`,
        color: theme.colors.textPrimary,
        fontSize: theme.typography.fontSizeMd,
        outline: 'none',
        transition: '0.2s',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.border = `1px solid ${theme.components.input.borderColorFocus}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.border = `1px solid ${theme.components.input.borderColor}`;
      }}
    />
  );
}
