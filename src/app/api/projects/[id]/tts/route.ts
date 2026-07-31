import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { buildBriefingScript } from "@/lib/mistral/translate";
import { synthesizeSpeech } from "@/lib/mistral/tts";
import { visibleInsightsForRole } from "@/lib/roleView";
import { getProjectState } from "@/lib/store";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user || !user.projectIds.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getProjectState(id);
  if (!state || !state.processed) {
    return NextResponse.json({ error: "Process the project first" }, { status: 400 });
  }

  const insights = visibleInsightsForRole(state.insights, user.role);
  const openConflicts = state.conflicts
    .filter((c) => c.status === "open")
    .map((c) => ({ description: c.description, confidence: c.confidence }));

  try {
    const script = await buildBriefingScript(insights, user.role, openConflicts);
    const result = await synthesizeSpeech(script);
    return NextResponse.json({ script, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Audio generation failed" },
      { status: 500 },
    );
  }
}
