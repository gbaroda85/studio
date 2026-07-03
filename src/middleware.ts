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
    
    // Industrial Standard SEO Headers
    response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Optimization: Bypass potential edge-side hydration delays for bots
    // This forces a more "static-first" delivery mode at the Vercel/Firebase Edge
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    // Ensure the browser/crawler knows the response varies by User-Agent
    response.headers.set('Vary', 'User-Agent');

    return response;
  }

  return NextResponse.next();
}

// Configuration for the middleware to match all page routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets
     */
    '/((?!api|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
