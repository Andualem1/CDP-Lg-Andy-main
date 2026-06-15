import "server-only";

import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  createSessionCookieValue,
  getSessionSecret,
  parseSessionCookieValue,
  type AuthSession,
} from "./session-codec";
import { shouldUseSecureCookies } from "../app-url";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getCookieOptions() {
  const secure = shouldUseSecureCookies();

  return {
    httpOnly: true,
    sameSite: secure ? ("none" as const) : ("lax" as const),
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
  };
}

export async function getCurrentSession() {
  const globalMock = (globalThis as unknown as { __mockSession?: AuthSession }).__mockSession;
  if (globalMock) {
    return globalMock;
  }
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    return parseSessionCookieValue(cookieValue, getSessionSecret());
  } catch {
    return null;
  }
}

export async function setCurrentSession(session: AuthSession) {
  const cookieStore = await cookies();
  const cookieValue = await createSessionCookieValue(
    session,
    getSessionSecret(),
  );

  cookieStore.set(AUTH_COOKIE_NAME, cookieValue, getCookieOptions());
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, "", {
    ...getCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}
