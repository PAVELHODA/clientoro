// PATH: src/components/ClientoroLogo.tsx
'use client'

export default function ClientoroLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring - gold coin edge */}
      <circle cx="50" cy="50" r="48" stroke="url(#coinEdge)" strokeWidth="4" fill="url(#coinBg)" />
      
      {/* Sun / sky - upper half */}
      <clipPath id="upperHalf">
        <rect x="6" y="6" width="88" height="42" />
      </clipPath>
      <circle cx="50" cy="50" r="44" fill="url(#sunGrad)" clipPath="url(#upperHalf)" />
      
      {/* Ocean - lower half */}
      <clipPath id="lowerHalf">
        <rect x="6" y="48" width="88" height="46" />
      </clipPath>
      <circle cx="50" cy="50" r="44" fill="url(#oceanGrad)" clipPath="url(#lowerHalf)" />
      
      {/* Horizon line */}
      <line x1="10" y1="48" x2="90" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      
      {/* Sun gleam on horizon */}
      <ellipse cx="50" cy="48" rx="12" ry="3" fill="url(#gleam)" opacity="0.8" />
      
      {/* Sun reflection in water */}
      <line x1="50" y1="51" x2="50" y2="70" stroke="url(#reflection)" strokeWidth="1.5" opacity="0.4" />
      
      {/* Subtle coin notches */}
      <circle cx="50" cy="50" r="46" stroke="url(#coinEdge)" strokeWidth="0.5" fill="none" opacity="0.3" />
      
      <defs>
        <linearGradient id="coinEdge" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#d4a017" />
          <stop offset="50%" stopColor="#f5c842" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
        <linearGradient id="coinBg" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="45%" stopColor="#d97706" />
          <stop offset="55%" stopColor="#0f6b7a" />
          <stop offset="100%" stopColor="#0c2d48" />
        </linearGradient>
        <linearGradient id="sunGrad" x1="50" y1="6" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="oceanGrad" x1="50" y1="48" x2="50" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f6b7a" />
          <stop offset="100%" stopColor="#0c2d48" />
        </linearGradient>
        <radialGradient id="gleam" cx="50" cy="48" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="reflection" x1="50" y1="51" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}