import { NextResponse } from "next/server";
import { translateInsight } from "@/lib/mistral/translate";
import { getStore, upsertInsightFramings } from "@/lib/store";
import type { Role } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { insightId?: string; role?: Role };
  if (!body.insightId || !body.role) {
    return NextResponse.json(
      { error: "insightId and role required" },
      { status: 400 },
    );
  }

  const store = getStore();
  const insight = store.insights.find((i) => i.id === body.insightId);
  if (!insight) {
    return NextResponse.json({ error: "Insight not found" }, { status: 404 });
  }

  const framing = await translateInsight(insight, body.role);
  upsertInsightFramings(insight.id, { [body.role]: framing });

  return NextResponse.json({ insightId: insight.id, role: body.role, framing });
}
