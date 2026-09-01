import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public: login page, all API routes, and the not-found page.
  if (pathname.startsWith('/login') || pathname.startsWith('/api') || pathname === '/_not-found') {
    return NextResponse.next();
  }

  const username = process.env.APP_USERNAME;
  const secret = process.env.APP_AUTH_SECRET;
  if (!username || !secret) {
    return NextResponse.next(); // auth not configured => allow
  }

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(session, username, secret)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
