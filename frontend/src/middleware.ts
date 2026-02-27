import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes require authentication
const protectedRoutes = ['/dashboard', '/history', '/settings', '/assessment'];
const authRoutes = ['/login', '/register'];
const publicRoutes = ['/admin'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for cookie matching our mock session token
    const hasToken = request.cookies.has('session_token');

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Allow public routes (e.g. /admin) without auth
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Redirect to login if accessing a protected route without a token
    if (isProtectedRoute && !hasToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to dashboard if trying to login/register while already authenticated
    if (isAuthRoute && hasToken) {
        return NextResponse.redirect(new URL('/assessment', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
