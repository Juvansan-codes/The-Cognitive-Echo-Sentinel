import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/history", "/settings", "/assessment"];
const authRoutes = ["/login", "/register"];
const publicRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Fetch the server-side session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Allow public routes without auth
    if (isPublicRoute) {
        return supabaseResponse;
    }

    // --- BYPASS AUTH FOR TESTING ---
    // // Redirect to login if accessing a protected route without a user session
    // if (isProtectedRoute && !user) {
    //     const url = request.nextUrl.clone();
    //     url.pathname = "/login";
    //     return NextResponse.redirect(url);
    // }

    // // Redirect to dashboard if trying to login/register while already authenticated
    // // if (isAuthRoute && user) {
    // //     const url = request.nextUrl.clone();
    // //     url.pathname = "/assessment";
    // //     return NextResponse.redirect(url);
    // // }
    // -------------------------------

    return supabaseResponse;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
