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
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1.5px solid #e2e8f0', // border-slate-200 to match header logo container
          padding: '1px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
            {/* GR Text - Dark Teal (#0d5a71) */}
            <span style={{ 
              color: '#0d5a71', 
              fontSize: '13px', 
              fontWeight: 900, 
              fontFamily: 'sans-serif',
              letterSpacing: '-0.5px'
            }}>GR</span>
            {/* 7 - Bright Red (#ef4444) */}
            <span style={{ 
              color: '#ef4444', 
              fontSize: '17px', 
              fontWeight: 900, 
              fontFamily: 'sans-serif',
              marginLeft: '0px'
            }}>7</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
