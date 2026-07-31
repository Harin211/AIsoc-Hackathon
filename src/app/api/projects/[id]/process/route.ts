import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { processProject } from "@/lib/pipeline";
import { buildProjectView } from "@/lib/roleView";
import { getChatTurns } from "@/lib/store";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user || !user.projectIds.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { forceCurated?: boolean };

  try {
    const result = await processProject(id, { forceCurated: Boolean(body.forceCurated) });
    const chat = await getChatTurns(id, user.id);
    return NextResponse.json({
      mode: result.mode,
      note: result.note,
      view: buildProjectView(result.state, user.role, chat),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Process failed" },
      { status: 400 },
    );
  }
}
