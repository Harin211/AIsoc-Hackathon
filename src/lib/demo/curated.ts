import type { ConflictFlag, Insight, ProjectNotebook } from "@/lib/types";

export const DEMO_PROJECT: ProjectNotebook = {
  id: "q3_launch",
  name: "Q3 Launch",
  description:
    "Cross-functional launch of payments + onboarding analytics. Hard retrieval boundary for all RAG.",
};

/** Curated fallback when MISTRAL_API_KEY is absent — mirrors expected extraction output */
export const CURATED_INSIGHTS: Insight[] = [
  {
    id: "insight_0031",
    project_id: "q3_launch",
    source_type: "meeting_transcript",
    source_refs: [
      {
        channel: "meeting",
        line_ids: [104, 107, 108, 114],
        timestamp: "00:05:18",
      },
    ],
    raw_statement:
      "Public Q3 Launch date is committed as September 15; marketing proceeds on that date.",
    topic: "launch_timeline",
    impact_domains: ["engineering", "marketing", "executive"],
    framings: {
      engineering:
        "Product committed September 15 launch; API contracts must freeze by July 28 to hold that date.",
      marketing:
        "Q3 launch is locked for September 15 — agency, press kit, and influencer holds should assume that date.",
      product:
        "September 15 is the committed launch date for the full feature set — treat it as fixed scope planning input.",
      executive:
        "Board-facing commitment: September 15 Q3 launch. Slippage requires two weeks' notice.",
    },
    confidence: 0.94,
    extracted_at: "2026-07-30T09:12:00Z",
  },
  {
    id: "insight_0038",
    project_id: "q3_launch",
    source_type: "meeting_transcript",
    source_refs: [
      {
        channel: "meeting",
        line_ids: [106, 107, 112],
        timestamp: "00:07:44",
      },
    ],
    raw_statement:
      "Engineering freezes API contracts by July 28; analytics depends on a stable events API.",
    topic: "api_freeze",
    impact_domains: ["engineering", "marketing", "product"],
    framings: {
      engineering:
        "Hard freeze on API contracts July 28; onboarding analytics rides the events API and needs it stable.",
      marketing:
        "Feature set for launch assumes the events API stays unchanged after July 28.",
      product:
        "Onboarding analytics ships with launch only if the events API contract holds past July 28 — a hard dependency to track.",
      executive:
        "Technical prerequisite for September 15: API freeze held on July 28.",
    },
    confidence: 0.9,
    extracted_at: "2026-07-30T09:12:00Z",
  },
  {
    id: "insight_0042",
    project_id: "q3_launch",
    source_type: "discord",
    source_refs: [
      {
        channel: "discord",
        message_ids: ["9821005", "9821006", "9821007"],
        timestamp: "2026-07-29T10:04:00Z",
      },
    ],
    raw_statement:
      "Backend refactor on the events API pushes API-dependent launch features to Q4 (~3 weeks / early October).",
    topic: "launch_timeline",
    impact_domains: ["engineering", "marketing", "product", "executive"],
    framings: {
      engineering:
        "Events API schema rewrite (~3 weeks) slips dependent endpoints — including onboarding analytics — into early Q4.",
      marketing:
        "Launch-critical features tied to the events API will not be ready for the September 15 campaign date; earliest is early October.",
      product:
        "Onboarding analytics and a couple of launch-critical endpoints are now blocked on a ~3-week backend rewrite — expect them to slip out of the September 15 scope.",
      executive:
        "Q3 launch date is at risk: engineering now implies Q4 for API-dependent features. Recommend confirming Q4 fallback.",
    },
    confidence: 0.91,
    extracted_at: "2026-07-30T09:12:00Z",
  },
  {
    id: "insight_0045",
    project_id: "q3_launch",
    source_type: "discord",
    source_refs: [
      {
        channel: "discord",
        message_ids: ["9821008", "9821009"],
        timestamp: "2026-07-30T08:02:00Z",
      },
    ],
    raw_statement:
      "PM and Marketing still believe September 15 is unchanged as of July 30 — no reconciliation with the backend refactor thread.",
    topic: "launch_timeline",
    impact_domains: ["marketing", "product", "executive"],
    framings: {
      engineering:
        "Cross-team: PM/Marketing have not absorbed the events API slip yet — Sept 15 still treated as live.",
      marketing:
        "As of July 30 you were still planning Sept 15 creative review — engineering may have moved the date without a channel ping to #q3-launch.",
      product:
        "Roadmap still shows September 15 as of July 30 — the engineering slip hasn't been reconciled into scope planning yet.",
      executive:
        "As of July 30, PM still reported no change from the July 14 decision — despite an engineering-only Discord thread implying Q4.",
    },
    confidence: 0.88,
    extracted_at: "2026-07-30T09:12:00Z",
  },
];

export const CURATED_CONFLICTS: ConflictFlag[] = [
  {
    id: "conflict_0007",
    project_id: "q3_launch",
    type: "explicit_contradiction",
    involved_insights: ["insight_0031", "insight_0042"],
    description:
      "PM stated Q3 launch (September 15) in the 07/14 meeting; engineer's 07/29 Discord message implies Q4 due to backend refactor. No reconciliation found between the two.",
    confidence: 0.87,
    status: "open",
  },
  {
    id: "conflict_0008",
    project_id: "q3_launch",
    type: "possible_mismatch",
    involved_insights: ["insight_0042", "insight_0045"],
    description:
      "Engineering flagged a Q4 slip in #eng-backend on 07/29, but on 07/30 PM confirmed to Marketing that nothing changed from the July 14 meeting.",
    confidence: 0.82,
    status: "open",
  },
];
