
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element to match the new GR7 brand identity
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          border: '1.5px solid #7c3aed', // Primary purple border
          fontWeight: 900,
          fontSize: '16px',
          fontFamily: 'sans-serif',
          letterSpacing: '-1px',
        }}
      >
        <span style={{ color: '#0f172a' }}>GR</span>
        <span style={{ 
          color: '#7c3aed', 
          fontSize: '20px', 
          fontStyle: 'italic',
          marginLeft: '-1px'
        }}>7</span>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
