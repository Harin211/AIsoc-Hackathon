import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";
import { findUserByCredentials, toSessionUser } from "@/lib/auth/users";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };

  if (!body.username || !body.password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 },
    );
  }

  const user = await findUserByCredentials(body.username, body.password);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ user: toSessionUser(user) });
}
