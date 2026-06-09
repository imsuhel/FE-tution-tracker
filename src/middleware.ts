import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for static assets, images, and internal Next.js paths
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') ||
    pathname.includes('.') // matches files like favicon.ico
  ) {
    return NextResponse.next();
  }

  // 2. Unauthenticated users: Trying to access dashboard -> Redirect to login
  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated users: Trying to access auth pages -> Redirect to dashboard
  if (token && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Optional: Minimal matcher for performance
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
