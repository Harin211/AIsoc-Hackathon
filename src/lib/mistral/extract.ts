import { chatJson, hasMistralKey, MODELS } from "@/lib/mistral/client";
import type { ChatMessage, Insight, TranscriptLine } from "@/lib/types";

const INSIGHT_SCHEMA = `{
  "insights": [
    {
      "id": "insight_XXXX",
      "project_id": "q3_launch",
      "source_type": "meeting_transcript | discord | slack",
      "source_refs": [
        { "channel": "meeting", "line_ids": [104], "timestamp": "00:05:18" },
        { "channel": "discord", "message_ids": ["9821005"], "timestamp": "2026-07-29T10:04:00Z" }
      ],
      "raw_statement": "factual claim extracted verbatim in spirit",
      "topic": "snake_case_topic",
      "impact_domains": ["engineering", "marketing", "executive"],
      "framings": {
        "engineering": "...",
        "marketing": "...",
        "executive": "..."
      },
      "confidence": 0.0,
      "extracted_at": "ISO-8601"
    }
  ]
}`;

export async function extractInsights(input: {
  projectId: string;
  transcript: TranscriptLine[];
  discord: ChatMessage[];
}): Promise<Insight[]> {
  if (!hasMistralKey()) {
    throw new Error("NO_API_KEY");
  }

  const transcriptBlock = input.transcript
    .map(
      (l) =>
        `[line ${l.id}] (${l.timestamp}) ${l.speaker} <${l.role}>: ${l.text}`,
    )
    .join("\n");

  const discordBlock = input.discord
    .map(
      (m) =>
        `[msg ${m.id}] (${m.timestamp}) #${m.channel} @${m.author} <${m.role}>: ${m.text}`,
    )
    .join("\n");

  const system = `You are SyncSpace Insight Extractor. Extract a single verified set of Insight objects from meeting transcript and chat.
Rules:
- Output ONLY valid JSON matching this schema: ${INSIGHT_SCHEMA}
- impact_domains is a LIST — tag every department the insight affects (many-to-many). Never force a single bucket.
- source_refs MUST cite exact line_ids / message_ids from the input. Provenance depends on this.
- framings change altitude/jargon per role but MUST preserve every concrete number, date, and severity from the source.
- Prefer 3–6 high-signal insights over noise.
- project_id must be "${input.projectId}".
- extracted_at must be the current ISO timestamp.
- confidence is 0–1.`;

  const user = `PROJECT: ${input.projectId}

=== MEETING TRANSCRIPT ===
${transcriptBlock}

=== DISCORD / CHAT LOG ===
${discordBlock}

Extract insights now as JSON.`;

  const result = await chatJson<{ insights: Insight[] }>(system, user, {
    model: MODELS.large,
    temperature: 0.1,
  });

  const now = new Date().toISOString();
  return (result.insights ?? []).map((insight, idx) => ({
    ...insight,
    id: insight.id || `insight_${String(idx + 1).padStart(4, "0")}`,
    project_id: input.projectId,
    extracted_at: insight.extracted_at || now,
    impact_domains: insight.impact_domains?.length
      ? insight.impact_domains
      : ["engineering", "marketing", "executive"],
    framings: insight.framings ?? {},
    source_refs: insight.source_refs ?? [],
    confidence: clamp01(insight.confidence ?? 0.7),
  }));
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
