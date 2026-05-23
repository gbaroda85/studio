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
          background: 'white',
          borderRadius: '8px',
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
          {/* GR Text - Dark Teal (Ultra Bold) */}
          <text 
            x="4" 
            y="65" 
            style={{ 
              fill: '#0d5a71', 
              fontSize: '52px', 
              fontWeight: 900, 
              fontFamily: 'sans-serif'
            }}
          >
            GR
          </text>
          {/* 7 - Bright Red (Ultra Bold) */}
          <text 
            x="64" 
            y="85" 
            style={{ 
              fill: '#ef4444', 
              fontSize: '78px', 
              fontWeight: 900, 
              fontFamily: 'sans-serif'
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
