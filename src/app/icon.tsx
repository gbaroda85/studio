
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
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          style={{ display: 'block' }}
        >
          {/* GR Text - Dark Teal */}
          <text 
            x="4" 
            y="65" 
            style={{ 
              fill: '#0d5a71', 
              fontSize: '44px', 
              fontWeight: 900, 
              fontFamily: 'sans-serif'
            }}
          >
            GR
          </text>
          {/* 7 - Red */}
          <text 
            x="58" 
            y="75" 
            style={{ 
              fill: '#ef4444', 
              fontSize: '65px', 
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
