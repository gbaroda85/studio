
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation matching the user-provided Teal/Red logo
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
          borderRadius: '8px',
          border: '1.5px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 100 100"
          style={{ display: 'block' }}
        >
          {/* GR Text - Teal */}
          <text 
            x="5" 
            y="75" 
            style={{ 
              fill: '#0d5a71', 
              fontSize: '52px', 
              fontWeight: 900, 
              fontFamily: 'sans-serif',
              letterSpacing: '-4px'
            }}
          >
            GR
          </text>
          {/* 7 - Red Triangle Style */}
          <path 
            d="M62 25 L92 25 L65 85 Z" 
            style={{ fill: '#f25858' }}
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
