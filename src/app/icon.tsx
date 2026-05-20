
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
      // ImageResponse JSX element to match GR7 logo
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          fontWeight: 900,
          fontSize: '18px',
          fontFamily: 'sans-serif',
        }}
      >
        <span style={{ color: '#006071' }}>GR</span>
        <span style={{ color: '#f15a4b' }}>7</span>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
