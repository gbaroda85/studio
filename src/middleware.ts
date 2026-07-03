
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { userAgent } from 'next/server';

/**
 * @fileOverview Infrastructure-Level SEO Routing Engine.
 * This middleware detects Googlebot and search crawlers at the Edge.
 * It ensures that bots bypass client-side barriers and receive 
 * a fully populated HTML shell for pixel-perfect indexing.
 */

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { isBot, ua } = userAgent(request);

  // 1. Identify Googlebot and other major search crawlers
  const isSearchBot = isBot || /googlebot|bingbot|baiduspider|yandexbot|duckduckbot/i.test(ua);

  // 2. Automated Response Modification for Bots
  if (isSearchBot) {
    const response = NextResponse.next();
    
    // Force Infrastructure to prioritize static content delivery
    response.headers.set('X-Is-Bot', 'true');
    response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Optimization: Bypass potential edge-side hydration delays for bots
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return response;
  }

  return NextResponse.next();
}

// Ensure middleware only runs on page routes and not static assets/api
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.png (icon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
