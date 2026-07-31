import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { generateMermaid } from "@/lib/mistral/mermaid";
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

  const state = getProjectState(id);
  if (!state) {
    return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
  }

  try {
    const mermaid = await generateMermaid(state.insights, state.conflicts);
    return NextResponse.json({ mermaid });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Mermaid generation failed" },
      { status: 500 },
    );
  }
}
