import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { signSessionToken, verifySessionToken } from "@/lib/auth/token";
import { findUserById, toSessionUser } from "@/lib/auth/users";
import type { SessionUser } from "@/lib/types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  const user = await findUserById(userId);
  return user ? toSessionUser(user) : null;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
