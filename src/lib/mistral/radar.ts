import { chatJson, hasMistralKey, MODELS } from "@/lib/mistral/client";
import type { ConflictFlag, Insight } from "@/lib/types";

export async function detectConflicts(
  projectId: string,
  insights: Insight[],
): Promise<ConflictFlag[]> {
  if (!hasMistralKey()) {
    throw new Error("NO_API_KEY");
  }

  const system = `You are SyncSpace Alignment Radar. Compare insights across channels and time.
Prioritize cross-channel, cross-time contradictions (meeting vs chat; this week vs last week).
Output ONLY JSON:
{
  "conflicts": [
    {
      "id": "conflict_XXXX",
      "project_id": "${projectId}",
      "type": "explicit_contradiction | possible_mismatch",
      "involved_insights": ["insight_id", "..."],
      "description": "plain language, mention dates/channels",
      "confidence": 0.0,
      "status": "open"
    }
  ]
}
Rules:
- Only flag real contradictions or plausible mismatches — do not invent conflicts.
- Always include confidence (0–1). Prefer precision over recall.
- status must be "open".
- involved_insights must reference provided insight ids.`;

  const user = `PROJECT: ${projectId}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

Run the Alignment Radar diff pass.`;

  const result = await chatJson<{ conflicts: ConflictFlag[] }>(system, user, {
    model: MODELS.large,
    temperature: 0.1,
  });

  return (result.conflicts ?? []).map((c, idx) => ({
    ...c,
    id: c.id || `conflict_${String(idx + 1).padStart(4, "0")}`,
    project_id: projectId,
    status: "open",
    confidence: Math.max(0, Math.min(1, c.confidence ?? 0.7)),
  }));
}
