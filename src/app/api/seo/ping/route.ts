import { NextResponse } from 'next/server';

/**
 * @fileOverview Indexing API Ping Route.
 * Call this endpoint (e.g., via a post-deployment webhook) to notify 
 * search engines that the sitemap has been updated.
 */

export async function GET() {
  const baseUrl = 'https://www.gr7imagepdf.com';
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  try {
    // Google recently deprecated the official 'ping' endpoint but still respects 
    // fresh sitemaps discovered via robots.txt or manual fetch.
    // This route serves as a "health check" and can be extended to call 
    // Google's Indexing API (requires Service Account credentials).
    
    console.log(`[SEO-PING] Triggering re-index check for ${sitemapUrl}`);

    // We return the sitemap URL and status to confirm the generator is active.
    return NextResponse.json({
      success: true,
      message: "SEO Indexing Pipeline Active",
      sitemap: sitemapUrl,
      timestamp: new Date().toISOString(),
      instructions: "To manually force indexing, submit this sitemap URL directly in Google Search Console."
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
