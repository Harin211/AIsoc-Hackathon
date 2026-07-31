import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { buildProjectView } from "@/lib/roleView";
import { getChatTurns, getProjectState } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user || !user.projectIds.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getProjectState(id);
  if (!state) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const chat = await getChatTurns(id, user.id);
  return NextResponse.json({ view: buildProjectView(state, user.role, chat) });
}
