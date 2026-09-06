import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Free Online Converter';
  const category = searchParams.get('category') || 'All-in-One Utility';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#090d16',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '10px 22px',
              borderRadius: '999px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '1px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            {category.toUpperCase()}
          </div>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            apextools.app
          </div>
        </div>

        {/* Center Main Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>
          <h1
            style={{
              fontSize: '58px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '26px',
              color: '#94a3b8',
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Fast, Free & Secure Online Tool • Zero Registration • Auto-Purged in 1hr
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            color: '#10b981',
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          <span>⚡ Instant Output</span>
          <span>🔒 100% Private</span>
          <span>🇵🇰 Regional Standards</span>
          <span>📱 Mobile Optimized</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
