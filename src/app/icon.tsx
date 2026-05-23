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
          borderRadius: '4px',
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
          {/* GR Text - Dark Teal (Ultra Bold) - Perfectly visible in small size */}
          <text 
            x="2" 
            y="65" 
            style={{ 
              fill: '#0d5a71', 
              fontSize: '52px', 
              fontWeight: 950, 
              fontFamily: 'sans-serif'
            }}
          >
            GR
          </text>
          {/* 7 - Bright Red (Ultra Bold) - High contrast against white background */}
          <text 
            x="56" 
            y="92" 
            style={{ 
              fill: '#ef4444', 
              fontSize: '84px', 
              fontWeight: 950, 
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
