// PATH: src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Clientoro — AI Booking & Growth OS'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0c3350, #134a6a, #1d8898)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(245,158,11,0.3)',
          }}
        >
          <span style={{ fontSize: 44, fontWeight: 800, color: '#0c3350' }}>C</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Clientoro
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 28,
            color: '#fbbf24',
            margin: '0 0 32px',
            fontWeight: 600,
          }}
        >
          AI Booking & Growth OS
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            maxWidth: 700,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Chytrý kalendář, který pomáhá zaplnit termíny a získat nové klienty.
        </p>

        {/* Bottom badges */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['Rezervace', 'CRM', 'AI', 'Růst'].map((badge) => (
            <div
              key={badge}
              style={{
                padding: '8px 20px',
                borderRadius: 24,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
