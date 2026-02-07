import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  // IMPORTANT: Do not add logic between createServerClient and supabase.auth.getUser().
  // A simple mistake could make it very hard to debug issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect /login and /signup to home with auth modal
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    const url = request.nextUrl.clone();
    const nextParam = url.searchParams.get("next");
    const roleParam = url.searchParams.get("role");
    url.pathname = "/";
    url.searchParams.delete("next");
    url.searchParams.delete("role");
    url.searchParams.set("auth", "open");
    if (nextParam) url.searchParams.set("next", nextParam);
    if (roleParam) url.searchParams.set("role", roleParam);
    return NextResponse.redirect(url);
  }

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/demo");

  // Redirect unauthenticated users to home with auth modal (with return URL)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "open");
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from home to dashboard
  // Preserve "next" param so users land where they intended (e.g. after login)
  const isAuthPage = pathname.startsWith("/forgot-password");

  if (user && (pathname === "/" || isAuthPage)) {
    const url = request.nextUrl.clone();
    const nextParam = url.searchParams.get("next");
    // Validate next to prevent open redirect; only allow internal paths
    const safeNext =
      nextParam &&
      nextParam.startsWith("/") &&
      !nextParam.startsWith("//") &&
      !nextParam.includes(":");
    url.pathname = safeNext ? nextParam : "/dashboard";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
