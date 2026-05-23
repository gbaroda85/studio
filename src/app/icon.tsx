import { ImageResponse } from 'next/og'

export const runtime = 'edge'

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
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1.5px solid #e2e8f0', // Matches Header Logo border exactly
          padding: '1px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', position: 'relative', width: '100%', height: '100%' }}>
            {/* GR Text - Dark Teal (#0d5a71) */}
            <span style={{ 
              color: '#0d5a71', 
              fontSize: '13px', 
              fontWeight: 900, 
              fontFamily: 'sans-serif',
              position: 'absolute',
              left: '2px',
              bottom: '4px',
              letterSpacing: '-0.5px'
            }}>GR</span>
            {/* 7 - Bright Red (#ef4444) */}
            <span style={{ 
              color: '#ef4444', 
              fontSize: '20px', 
              fontWeight: 900, 
              fontFamily: 'sans-serif',
              position: 'absolute',
              right: '2px',
              top: '-1px'
            }}>7</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
