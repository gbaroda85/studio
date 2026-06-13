import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'GR7 Tools Hub - 100% Private Image & PDF Studio'
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
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: 200, background: '#0d5a71', opacity: 0.03 }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: 200, background: '#ef4444', opacity: 0.03 }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px',
          marginBottom: '20px'
        }}>
           {/* The Official Logo Box */}
           <div style={{
              width: '220px',
              height: '220px',
              backgroundColor: 'white',
              borderRadius: '50px',
              border: '8px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.15)',
              position: 'relative'
           }}>
             <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', position: 'relative', width: '100%', height: '100%' }}>
                <span style={{ color: '#0d5a71', fontSize: '90px', fontWeight: 900, position: 'absolute', left: '15px', bottom: '30px', letterSpacing: '-4px' }}>GR</span>
                <span style={{ color: '#ef4444', fontSize: '150px', fontWeight: 900, position: 'absolute', right: '15px', top: '-15px' }}>7</span>
             </div>
           </div>

           {/* Brand Text */}
           <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '110px', fontWeight: 900, color: '#1e293b', letterSpacing: '-5px', lineHeight: 1 }}>TOOLS</span>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '6px', marginTop: '10px' }}>Hub Studio</span>
           </div>
        </div>
        
        <div style={{
          fontSize: '34px',
          color: '#475569',
          marginTop: '30px',
          maxWidth: '850px',
          textAlign: 'center',
          fontWeight: 600,
          lineHeight: 1.4
        }}>
          Fastest local browser tools for Images, PDFs and Calculators. <br/>
          <span style={{ color: '#0d5a71', fontWeight: 800 }}>100% Private. No server uploads.</span>
        </div>

        {/* Feature Badges */}
        <div style={{
          marginTop: '50px',
          display: 'flex',
          gap: '24px'
        }}>
           <div style={{ background: '#0d5a71', color: 'white', padding: '12px 30px', borderRadius: '18px', fontSize: '22px', fontWeight: 800, boxShadow: '0 10px 20px rgba(13, 90, 113, 0.2)' }}>SECURE</div>
           <div style={{ background: '#ef4444', color: 'white', padding: '12px 30px', borderRadius: '18px', fontSize: '22px', fontWeight: 800, boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}>LOCAL</div>
           <div style={{ background: '#334155', color: 'white', padding: '12px 30px', borderRadius: '18px', fontSize: '22px', fontWeight: 800, boxShadow: '0 10px 20px rgba(51, 65, 85, 0.2)' }}>PRIVATE</div>
        </div>

        <div style={{ position: 'absolute', bottom: 40, fontSize: '18px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '4px' }}>
          www.gr7imagepdf.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
