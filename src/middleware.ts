import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isSearchEngineBot } from '@/lib/rate-limit/bot-guard';

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent');
  const pathname = request.nextUrl.pathname;

  // 1. Legitimate search engine bots always bypass rate limiting and auth redirects
  if (isSearchEngineBot(userAgent)) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'index, follow');
    return res;
  }

  // 2. Session update & route protection (e.g. /dashboard)
  return await updateSession(request);
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
