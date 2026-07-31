import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { buildProjectView } from "@/lib/roleView";
import { getProjectState } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user || !user.projectIds.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = getProjectState(id);
  if (!state) {
    return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
  }

  return NextResponse.json({ view: buildProjectView(state, user.role) });
}
