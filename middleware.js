import { NextResponse } from 'next/server';

// Define the protected routes that require authentication
const protectedRoutes = ['/dashboard', '/writer/dashboard', '/author/dashboard', '/admin/dashboard', '/editor/dashboard'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the current route is in the protected routes list
  // We use startsWith to catch subpaths like /dashboard/settings
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for the authentication token cookie
    // The frontend stores it as 'accessToken'
    const token = request.cookies.get('accessToken');

    // If no token exists, redirect instantly to login page to prevent flash
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // If token exists, we let it pass. The client-side Zustand store will handle role verification.
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAuthRoute) {
    const token = request.cookies.get('accessToken');
    if (token) {
      // Send them to dashboard, where client-side authRoutes.js will handle role-based redirection
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
