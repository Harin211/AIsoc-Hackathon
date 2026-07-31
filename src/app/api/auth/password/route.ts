import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { changePassword } from "@/lib/auth/users";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!body.currentPassword || !body.newPassword) {
    return NextResponse.json(
      { error: "Current and new password required" },
      { status: 400 },
    );
  }

  const result = await changePassword(user.id, body.currentPassword, body.newPassword);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
