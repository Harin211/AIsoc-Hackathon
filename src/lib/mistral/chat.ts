import { chatJson, hasMistralKey, MODELS } from "@/lib/mistral/client";
import { cosineSimilarity, embedTexts } from "@/lib/mistral/embed";
import type { ChatCitation, Insight, Role } from "@/lib/types";

const TOP_K = 5;

export async function answerFromNotebook(input: {
  role: Role;
  team: string;
  message: string;
  insights: Insight[];
}): Promise<{ answer: string; citations: ChatCitation[] }> {
  if (!input.insights.length) {
    return {
      answer:
        "This notebook has no processed insights yet — run Process on a source first.",
      citations: [],
    };
  }

  const insightTexts = input.insights.map((i) => i.raw_statement);
  const [queryEmbedding, ...insightEmbeddings] = await embedTexts([
    input.message,
    ...insightTexts,
  ]);

  const scored = input.insights
    .map((insight, idx) => ({
      insight,
      score: cosineSimilarity(queryEmbedding ?? [], insightEmbeddings[idx] ?? []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  if (!hasMistralKey()) {
    const top = scored[0]?.insight;
    const answer = top
      ? `${top.framings[input.role] ?? top.raw_statement} [set MISTRAL_API_KEY for live grounded chat]`
      : "No relevant insight found in this notebook.";
    return {
      answer,
      citations: top
        ? [{ insightId: top.id, sourceRefs: top.source_refs }]
        : [],
    };
  }

  const system = `You are the SyncSpace notebook assistant. Answer ONLY using the provided candidate insights — never invent facts.
The reader is a ${input.role} on the ${input.team} team. Frame the answer at their altitude, but never drop a concrete number, date, or severity present in the insights.
Always cite which insight ids you actually used. If the insights don't cover the question, say so plainly.
Return JSON: { "answer": "...", "insight_ids": ["insight_xxxx", "..."] }`;

  const user = JSON.stringify({
    question: input.message,
    candidate_insights: scored.map((s) => ({
      id: s.insight.id,
      raw_statement: s.insight.raw_statement,
      framing_for_role: s.insight.framings[input.role],
      topic: s.insight.topic,
    })),
  });

  const result = await chatJson<{ answer: string; insight_ids: string[] }>(
    system,
    user,
    { model: MODELS.large, temperature: 0.2 },
  );

  const citedIds = new Set(result.insight_ids ?? []);
  let citations: ChatCitation[] = input.insights
    .filter((i) => citedIds.has(i.id))
    .map((i) => ({ insightId: i.id, sourceRefs: i.source_refs }));

  if (!citations.length && scored[0]) {
    citations = [
      { insightId: scored[0].insight.id, sourceRefs: scored[0].insight.source_refs },
    ];
  }

  return { answer: result.answer || "No answer generated.", citations };
}
