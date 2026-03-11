import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/theme/useTheme';
import { useActive } from './useActive';
import NavIcon from './NavIcon';

export default function NavItem({
  label,
  icon,
  href,
}: {
  label: string;
  icon: string;
  href: string;
}) {
  const theme = useTheme();
  const active = useActive(href);

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: theme.radius.md,
        background: active ? theme.colors.primarySoft : 'transparent',
        color: active ? theme.colors.primary : theme.colors.textSecondary,
        fontSize: theme.typography.fontSizeMd,
        fontWeight: active ? theme.typography.weightMedium : theme.typography.weightRegular,
        textDecoration: 'none',
        transition: '0.2s',
      }}
    >
      <NavIcon name={icon} active={active} />
      {label}
    </Link>
  );
}
