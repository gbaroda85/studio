
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'GR7 Tools Hub - Private PDF & Image Studio'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
           <div style={{
              width: '180px',
              height: '180px',
              backgroundColor: 'white',
              borderRadius: '40px',
              border: '6px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', position: 'relative', width: '100%', height: '100%' }}>
                <span style={{ color: '#0d5a71', fontSize: '75px', fontWeight: 900, position: 'absolute', left: '15px', bottom: '25px', letterSpacing: '-3px' }}>GR</span>
                <span style={{ color: '#ef4444', fontSize: '120px', fontWeight: 900, position: 'absolute', right: '15px', top: '-10px' }}>7</span>
             </div>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '100px', fontWeight: 900, color: '#1e293b', letterSpacing: '-4px' }}>TOOLS</span>
              <span style={{ fontSize: '30px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '4px' }}>Hub Studio</span>
           </div>
        </div>
        
        <div style={{
          fontSize: '32px',
          color: '#475569',
          marginTop: '20px',
          maxWidth: '800px',
          textAlign: 'center',
          fontWeight: 600,
        }}>
          100% Private local browser tools for Images, PDFs and Calculators.
        </div>

        <div style={{
          marginTop: '40px',
          display: 'flex',
          gap: '20px'
        }}>
           <div style={{ background: '#0d5a71', color: 'white', padding: '10px 25px', borderRadius: '15px', fontSize: '20px', fontWeight: 800 }}>SECURE</div>
           <div style={{ background: '#ef4444', color: 'white', padding: '10px 25px', borderRadius: '15px', fontSize: '20px', fontWeight: 800 }}>LOCAL</div>
           <div style={{ background: '#334155', color: 'white', padding: '10px 25px', borderRadius: '15px', fontSize: '20px', fontWeight: 800 }}>PRIVATE</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
