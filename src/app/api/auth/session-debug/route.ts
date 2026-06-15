import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  getSessionSecret,
  parseSessionCookieValue,
} from "@/lib/auth/session-codec";
import { getAppBaseUrl, shouldUseSecureCookies } from "@/lib/app-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieValue = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  const session = cookieValue
    ? parseSessionCookieValue(cookieValue, getSessionSecret())
    : null;
  const resolvedSession = await session;

  return NextResponse.json({
    hasCookie: Boolean(cookieValue),
    cookieLength: cookieValue?.length ?? 0,
    sessionValid: Boolean(resolvedSession),
    session: resolvedSession
      ? {
          email: resolvedSession.email,
          name: resolvedSession.name,
          roles: resolvedSession.roles,
          issuedAt: resolvedSession.issuedAt,
        }
      : null,
    request: {
      host: headerStore.get("host"),
      protocol: headerStore.get("x-forwarded-proto"),
      forwardedHost: headerStore.get("x-forwarded-host"),
    },
    config: {
      appBaseUrl: getAppBaseUrl(),
      secureCookies: shouldUseSecureCookies(),
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL === "1",
      hasSessionSecret: Boolean(process.env.SESSION_SECRET?.trim()),
      hasNextPublicAppUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim()),
    },
  });
}
