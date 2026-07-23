import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionToken = 
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const path = request.nextUrl.pathname;

  // If there's no session token, redirect to login
  if (!sessionToken) {
    if (path.startsWith("/admin") || path.startsWith("/profile") || path.startsWith("/checkout")) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(path), request.url));
    }
  }

  // For admin routes, we verify user role via API or session.
  // In the middleware, we can fetch the session to verify roles.
  if (path.startsWith("/admin") && sessionToken) {
    try {
      const response = await fetch(new URL("/api/auth/get-session", request.url).toString(), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });
      const data = await response.json();
      if (!data || !data.user || data.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/checkout/:path*"],
};
