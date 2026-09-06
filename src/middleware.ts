import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isSearchEngineBot } from '@/lib/rate-limit/bot-guard';

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent');
  const pathname = request.nextUrl.pathname;

  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.geo?.country ||
    '';

  // 1. Legitimate search engine bots always bypass rate limiting and auth redirects
  if (isSearchEngineBot(userAgent)) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'index, follow');
    if (country) {
      res.headers.set('X-User-Country', country);
    }
    return res;
  }

  // 2. Session update & route protection (e.g. /dashboard)
  const response = await updateSession(request);
  if (country) {
    response.headers.set('X-User-Country', country);
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
