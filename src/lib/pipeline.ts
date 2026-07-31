import { embedTexts } from "@/lib/mistral/embed";
import { extractInsights } from "@/lib/mistral/extract";
import { detectConflicts } from "@/lib/mistral/radar";
import { loadCuratedDemo, setProcessed } from "@/lib/store";
import type { ChatMessage, InsightStore, TranscriptLine } from "@/lib/types";

export async function processNotebook(input: {
  projectId: string;
  transcript: TranscriptLine[];
  discord: ChatMessage[];
  forceCurated?: boolean;
}): Promise<{ store: InsightStore; mode: "mistral" | "curated"; note: string }> {
  // Soft RAG boundary: embed project label + sources so retrieval stays scoped
  await embedTexts([
    `project:${input.projectId}`,
    ...input.transcript.slice(0, 5).map((l) => l.text),
    ...input.discord.slice(0, 5).map((m) => m.text),
  ]);

  if (input.forceCurated) {
    return {
      store: loadCuratedDemo(),
      mode: "curated",
      note: "Loaded curated demo insights (forced).",
    };
  }

  try {
    const insights = await extractInsights(input);
    const conflicts = await detectConflicts(input.projectId, insights);
    return {
      store: setProcessed(insights, conflicts),
      mode: "mistral",
      note: "Extracted via Mistral Large 3 + Alignment Radar diff pass.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "NO_API_KEY" || message.includes("MISTRAL_API_KEY")) {
      return {
        store: loadCuratedDemo(),
        mode: "curated",
        note: "No MISTRAL_API_KEY — using curated demo Insight Store (identical schema).",
      };
    }
    // Graceful demo fallback if live API fails on stage
    return {
      store: loadCuratedDemo(),
      mode: "curated",
      note: `Mistral call failed (${message}). Fell back to curated demo data.`,
    };
  }
}
