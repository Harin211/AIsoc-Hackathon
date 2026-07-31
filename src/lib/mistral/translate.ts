import { chatJson, hasMistralKey, MODELS } from "@/lib/mistral/client";
import type { Insight, Role } from "@/lib/types";

const ROLE_ALTITUDE: Record<Role, string> = {
  engineering: "technical constraints, estimates, API/system impact",
  marketing: "campaign dates, deliverables, external messaging risk",
  product: "scope tradeoffs, feature prioritization, roadmap impact",
  executive: "strategic risk, board commitment, decision needed",
};

/**
 * Framing pass only — never re-extracts. Facts (numbers, dates, severity) stay pinned.
 */
export async function translateInsight(
  insight: Insight,
  role: Role,
): Promise<string> {
  const cached = insight.framings[role];
  if (cached) return cached;

  if (!hasMistralKey()) {
    return (
      insight.raw_statement +
      ` [${role} view — set MISTRAL_API_KEY for live framing]`
    );
  }

  const system = `You are SyncSpace Jargon Translator.
Rewrite ONE insight for a ${role} reader (${ROLE_ALTITUDE[role]}).
Guardrails:
- Change FRAMING and ALTITUDE only.
- Never drop a specific number, date, or severity present in raw_statement.
- Do not invent new facts.
- Return JSON: { "framing": "..." }`;

  const user = JSON.stringify({
    role,
    raw_statement: insight.raw_statement,
    topic: insight.topic,
    existing_framings: insight.framings,
  });

  const result = await chatJson<{ framing: string }>(system, user, {
    model: MODELS.small,
    temperature: 0.2,
  });

  return result.framing || insight.raw_statement;
}

export async function buildBriefingScript(
  insights: Insight[],
  role: Role,
  openConflicts: { description: string; confidence: number }[],
): Promise<string> {
  const bullets = insights
    .map((i) => i.framings[role] || i.raw_statement)
    .slice(0, 5);

  if (!hasMistralKey()) {
    const risk =
      openConflicts[0] != null
        ? `Open alignment risk (${Math.round(openConflicts[0].confidence * 100)}%): ${openConflicts[0].description}. `
        : "";
    return `${risk}${bullets.join(" ")}`.slice(0, 500);
  }

  const system = `You write a 20–30 second podcast-style executive audio script for SyncSpace.
Audience role: ${role}.
Open with any alignment risk FIRST, then 2–3 key takeaways.
No markdown. No bullet points. Spoken prose only.
Preserve every concrete date and number.
Return JSON: { "script": "..." }`;

  const result = await chatJson<{ script: string }>(
    system,
    JSON.stringify({ bullets, openConflicts }),
    { model: MODELS.small, temperature: 0.3 },
  );

  return result.script;
}
