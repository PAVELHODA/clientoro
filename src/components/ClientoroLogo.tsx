// PATH: src/components/ClientoroLogo.tsx
'use client'

export default function ClientoroLogo({ size = 32 }: { size?: number }) {
  const id = `logo_${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" stroke={`url(#${id}_edge)`} strokeWidth="4" fill={`url(#${id}_bg)`} />
      <clipPath id={`${id}_upper`}><rect x="6" y="6" width="88" height="42" /></clipPath>
      <circle cx="50" cy="50" r="44" fill={`url(#${id}_sun)`} clipPath={`url(#${id}_upper)`} />
      <clipPath id={`${id}_lower`}><rect x="6" y="48" width="88" height="46" /></clipPath>
      <circle cx="50" cy="50" r="44" fill={`url(#${id}_ocean)`} clipPath={`url(#${id}_lower)`} />
      <line x1="10" y1="48" x2="90" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <ellipse cx="50" cy="48" rx="12" ry="3" fill={`url(#${id}_gleam)`} opacity="0.8" />
      <line x1="50" y1="51" x2="50" y2="70" stroke={`url(#${id}_ref)`} strokeWidth="1.5" opacity="0.4" />
      <defs>
        <linearGradient id={`${id}_edge`} x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#d4a017" />
          <stop offset="50%" stopColor="#f5c842" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
        <linearGradient id={`${id}_bg`} x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="45%" stopColor="#d97706" />
          <stop offset="55%" stopColor="#0f6b7a" />
          <stop offset="100%" stopColor="#0c2d48" />
        </linearGradient>
        <linearGradient id={`${id}_sun`} x1="50" y1="6" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={`${id}_ocean`} x1="50" y1="48" x2="50" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f6b7a" />
          <stop offset="100%" stopColor="#0c2d48" />
        </linearGradient>
        <radialGradient id={`${id}_gleam`} cx="50" cy="48" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}_ref`} x1="50" y1="51" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}