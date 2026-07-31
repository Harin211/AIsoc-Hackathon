import crypto from "crypto";

const SECRET =
  process.env.SESSION_SECRET?.trim() ||
  "syncspace-demo-secret-do-not-use-in-prod";

function hmac(username: string): string {
  return crypto.createHmac("sha256", SECRET).update(username).digest("hex");
}

/** Demo-grade signed token: `username.hmac`. Not for production auth. */
export function signSessionToken(username: string): string {
  return `${username}.${hmac(username)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const username = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(username);

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return username;
}
