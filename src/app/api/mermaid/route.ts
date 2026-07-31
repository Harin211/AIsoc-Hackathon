import { NextResponse } from "next/server";
import { generateMermaid } from "@/lib/mistral/mermaid";
import { getStore } from "@/lib/store";

export async function POST() {
  const store = getStore();
  if (!store.processed) {
    return NextResponse.json(
      { error: "Process the notebook first" },
      { status: 400 },
    );
  }

  const mermaid = await generateMermaid(store.insights, store.conflicts);
  return NextResponse.json({ mermaid });
}
