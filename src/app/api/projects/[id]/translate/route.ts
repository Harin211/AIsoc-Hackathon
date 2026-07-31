import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { translateInsight } from "@/lib/mistral/translate";
import { getProjectState, upsertInsightFramings } from "@/lib/store";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getSessionUser();
  if (!user || !user.projectIds.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { insightId?: string };
  const state = await getProjectState(id);
  const insight = state?.insights.find((i) => i.id === body.insightId);
  if (!insight) {
    return NextResponse.json({ error: "Insight not found" }, { status: 404 });
  }

  try {
    const framing = await translateInsight(insight, user.role);
    const updated = await upsertInsightFramings(id, insight.id, { [user.role]: framing });
    return NextResponse.json({ insight: updated, framing });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Translation failed" },
      { status: 500 },
    );
  }
}
