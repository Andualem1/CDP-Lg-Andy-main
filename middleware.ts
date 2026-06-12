import { NextResponse, type NextRequest } from "next/server";
import { canAccessPath, isProtectedPath } from "./src/lib/auth/permissions";
import {
  AUTH_COOKIE_NAME,
  getSessionSecret,
  parseSessionCookieValue,
} from "./src/lib/auth/session-codec";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = await parseSessionCookieValue(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
    getSessionSecret(),
  );

  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(signInUrl);
  }

  if (!canAccessPath(session, pathname)) {
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    unauthorizedUrl.searchParams.set("from", pathname);

    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/learn/:path*", "/creator/:path*", "/admin/:path*"],
};
