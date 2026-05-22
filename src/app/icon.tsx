
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          style={{
            display: 'flex',
          }}
        >
          {/* GR Text - Dark Teal (Matching Header Logo) */}
          <text 
            x="4" 
            y="70" 
            style={{ 
              fill: '#0d5a71', 
              fontSize: '46px', 
              fontWeight: 900, 
              fontFamily: 'Arial Black, sans-serif'
            }}
          >
            GR
          </text>
          {/* 7 - Bright Red (Matching Header Logo) */}
          <text 
            x="62" 
            y="75" 
            style={{ 
              fill: '#ef4444', 
              fontSize: '68px', 
              fontWeight: 900, 
              fontFamily: 'Arial Black, sans-serif'
            }}
          >
            7
          </text>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
