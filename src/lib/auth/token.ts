import crypto from "crypto";

function getSecret(): string {
  const envSecret = process.env.SESSION_SECRET?.trim();
  if (envSecret) return envSecret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }
  return "syncspace-local-dev-secret-do-not-use-in-prod";
}

function hmac(userId: string): string {
  return crypto.createHmac("sha256", getSecret()).update(userId).digest("hex");
}

/** Signed session token: `userId.hmac`, verified against SESSION_SECRET. */
export function signSessionToken(userId: string): string {
  return `${userId}.${hmac(userId)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(userId);

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return userId;
}
