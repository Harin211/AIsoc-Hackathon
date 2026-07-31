import { NextResponse } from "next/server";
import {
  buildBriefingScript,
  translateInsight,
} from "@/lib/mistral/translate";
import { synthesizeSpeech } from "@/lib/mistral/tts";
import { getStore, upsertInsightFramings } from "@/lib/store";
import type { Role } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { role?: Role };
  const role: Role = body.role ?? "executive";
  const store = getStore();

  if (!store.processed) {
    return NextResponse.json(
      { error: "Process the notebook first" },
      { status: 400 },
    );
  }

  // Ensure framings exist for this role before scripting
  for (const insight of store.insights) {
    if (!insight.framings[role]) {
      const framing = await translateInsight(insight, role);
      upsertInsightFramings(insight.id, { [role]: framing });
      insight.framings[role] = framing;
    }
  }

  const openConflicts = store.conflicts
    .filter((c) => c.status === "open")
    .map((c) => ({
      description: c.description,
      confidence: c.confidence,
    }));

  const script = await buildBriefingScript(
    store.insights,
    role,
    openConflicts,
  );

  const speech = await synthesizeSpeech(script);

  return NextResponse.json({
    role,
    script,
    ...speech,
  });
}
