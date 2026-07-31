import { NextResponse } from "next/server";
import { updateConflictStatus } from "@/lib/store";
import type { ConflictStatus } from "@/lib/types";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json()) as { status?: ConflictStatus };
  if (!body.status || !["open", "confirmed", "dismissed"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const conflict = updateConflictStatus(id, body.status);
  if (!conflict) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ conflict });
}
