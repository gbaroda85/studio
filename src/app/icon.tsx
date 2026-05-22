
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
          padding: '0',
          margin: '0',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', height: '100%' }}>
            {/* G - Teal */}
            <span style={{ 
                color: '#0d5a71', 
                fontSize: '14px', 
                fontWeight: '900', 
                fontFamily: 'sans-serif',
                marginLeft: '-1px'
            }}>
                GR
            </span>
            {/* 7 - Bright Red */}
            <span style={{ 
                color: '#ef4444', 
                fontSize: '18px', 
                fontWeight: '900', 
                fontFamily: 'sans-serif',
                marginLeft: '1px'
            }}>
                7
            </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
