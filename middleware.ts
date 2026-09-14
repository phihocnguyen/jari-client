import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Middleware: Route Guard ───────────────────────────────────────
// Checks for jari-auth key in Zustand persisted localStorage (via cookie fallback)
// For pure localStorage auth, we rely on client-side redirects in layouts.
// Middleware only handles fast redirect for clearly unauthenticated requests.

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/auth/callback',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // We can't read localStorage in middleware; rely on client-side guards in layouts.
  // Middleware just passes through for now.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
