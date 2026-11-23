import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every page/API request (Next.js 16's replacement for `middleware.ts`).
 *
 * 1. Keeps the Supabase session alive: access tokens last ~1h, so when one has expired this
 *    refreshes it with the long-lived refresh token and writes the new cookies. This MUST happen
 *    here — Server Components can't set cookies, and refresh tokens rotate, so a refresh that
 *    isn't saved would eventually log the user out. Cookies are persistent (400 days), so the
 *    session survives closing and reopening the browser.
 * 2. Protects /dashboard and /onboarding (logged-out users go to the login page).
 * 3. Sends an already-signed-in user who opens the login page straight to their garden.
 *    Add `?switch=1` to the login URL to show the form anyway (account switching).
 *
 * API routes answer 401 JSON themselves, so here they only get the refresh.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  // No Supabase cookies at all => nobody is signed in; skip the network round-trip.
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!hasAuthCookie) {
    return isProtectedPage ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        // Update the incoming request (so Server Components see the fresh session) AND the response.
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Redirects must carry any refreshed/cleared auth cookies along.
  const redirectTo = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user && isProtectedPage) return redirectTo("/");

  const showLoginAnyway = searchParams.has("switch") || searchParams.has("registered");
  if (user && pathname === "/" && !showLoginAnyway) return redirectTo("/dashboard");

  return response;
}

export const config = {
  // Everything except static assets, so the session is refreshed no matter where the user lands.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)"],
};
