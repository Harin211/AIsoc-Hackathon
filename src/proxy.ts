import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/token";

/**
 * Route gate. Proxy checks the signed cookie only; every server route
 * also re-verifies the session (see `getSessionUser`) per the Next.js
 * guidance not to rely on Proxy alone for auth.
 *
 * "/" is the public marketing landing page — it never requires auth.
 * The authenticated dashboard lives at "/app" (and its sub-routes/APIs).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthApi = pathname.startsWith("/api/auth");
  const isStaticAsset =
    pathname.startsWith("/_next") || pathname === "/favicon.ico";
  const isPublicPage = pathname === "/";

  if (isAuthApi || isStaticAsset || isPublicPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(token);

  if (pathname === "/login") {
    if (userId) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.next();
  }

  if (!userId) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
