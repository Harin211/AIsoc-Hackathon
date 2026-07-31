import { NextResponse } from "next/server";
import { DEMO_DISCORD } from "@/lib/demo/discord";
import { DEMO_TRANSCRIPT } from "@/lib/demo/transcript";
import { processNotebook } from "@/lib/pipeline";
import { getStore, resetStore } from "@/lib/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    forceCurated?: boolean;
    reset?: boolean;
  };

  if (body.reset) {
    resetStore();
  }

  const store = getStore();
  const result = await processNotebook({
    projectId: store.project.id,
    transcript: DEMO_TRANSCRIPT,
    discord: DEMO_DISCORD,
    forceCurated: body.forceCurated,
  });

  return NextResponse.json({
    ok: true,
    mode: result.mode,
    note: result.note,
    store: result.store,
  });
}
