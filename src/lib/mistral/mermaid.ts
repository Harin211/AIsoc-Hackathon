import { chatJson, hasMistralKey, MODELS } from "@/lib/mistral/client";
import type { ConflictFlag, Insight } from "@/lib/types";

export async function generateMermaid(
  insights: Insight[],
  conflicts: ConflictFlag[],
): Promise<string> {
  if (!hasMistralKey()) {
    return fallbackMermaid(insights, conflicts);
  }

  const system = `You generate Mermaid.js flowchart syntax for SyncSpace decision evolution.
Return JSON: { "mermaid": "flowchart TD\\n..." }
Rules:
- Use flowchart TD
- Node labels short; wrap in quotes if needed
- Show how decisions evolved across time/channels
- Mark conflict nodes clearly
- No markdown fences
- Valid Mermaid only`;

  const result = await chatJson<{ mermaid: string }>(
    system,
    JSON.stringify({
      insights: insights.map((i) => ({
        id: i.id,
        topic: i.topic,
        raw: i.raw_statement,
        source: i.source_type,
      })),
      conflicts: conflicts
        .filter((c) => c.status !== "dismissed")
        .map((c) => ({
          id: c.id,
          type: c.type,
          involved: c.involved_insights,
          description: c.description,
        })),
    }),
    { model: MODELS.large, temperature: 0.2 },
  );

  return sanitizeMermaid(result.mermaid) || fallbackMermaid(insights, conflicts);
}

function sanitizeMermaid(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/^```mermaid\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function fallbackMermaid(
  insights: Insight[],
  conflicts: ConflictFlag[],
): string {
  const meeting = insights.find((i) => i.id === "insight_0031");
  const slip = insights.find((i) => i.id === "insight_0042");
  const open = conflicts.filter((c) => c.status === "open");

  return `flowchart TD
  M["14 Jul Meeting\\nQ3 Launch locked"] --> D["Decision: Sept 15"]
  D --> MK["Marketing books campaign"]
  D --> EN["Eng: API freeze Jul 28"]
  EN --> R["29 Jul Discord #eng-backend\\nEvents API refactor"]
  R --> Q4["Dependent features → Q4"]
  D -.->|unreconciled| X{"Alignment Gap"}
  Q4 --> X
  X --> F["Flag: Q3 vs Q4 contradiction"]
  MK -.->|still assumes Sept 15| F

  classDef risk fill:#fff1e8,stroke:#c2410c,color:#7c2d12
  classDef ok fill:#ecfdf5,stroke:#0f766e,color:#134e4a
  class D,MK,EN ok
  class R,Q4,X,F risk

  %% insight refs: ${meeting?.id ?? "n/a"} → ${slip?.id ?? "n/a"}
  %% open conflicts: ${open.map((c) => c.id).join(", ") || "none"}`;
}
