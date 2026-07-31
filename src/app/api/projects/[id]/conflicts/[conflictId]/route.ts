import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { updateConflictStatus } from "@/lib/store";
import type { ConflictStatus } from "@/lib/types";

const VALID_STATUSES: ConflictStatus[] = ["open", "confirmed", "dismissed"];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; conflictId: string }> },
) {
  const { id, conflictId } = await ctx.params;
  const user = await getSessionUser();
  if (!user || !user.projectIds.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !VALID_STATUSES.includes(body.status as ConflictStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const conflict = await updateConflictStatus(id, conflictId, body.status as ConflictStatus);
  if (!conflict) {
    return NextResponse.json({ error: "Conflict not found" }, { status: 404 });
  }

  return NextResponse.json({ conflict });
}
