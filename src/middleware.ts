import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const protectedRoutes = ['/dashboard', '/dashboard/appointments', '/dashboard/services', '/dashboard/staff', '/dashboard/settings', '/dashboard/analytics'];

export async function middleware(request: NextRequest) {

  const idToken = request.cookies.get('firebaseToken')?.value;

  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!idToken) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
