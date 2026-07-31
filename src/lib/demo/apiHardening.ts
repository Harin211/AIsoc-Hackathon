import type {
  ChatMessage,
  ConflictFlag,
  Insight,
  Project,
  TranscriptLine,
} from "@/lib/types";

/** Second seed project — ships pre-processed so it needs no Mistral call. */
export const DEMO_PROJECT_API: Project = {
  id: "api_hardening",
  name: "API Hardening",
  description:
    "Platform reliability workstream ahead of Q4 — rate limiting and auth hardening.",
};

export const API_TRANSCRIPT: TranscriptLine[] = [
  {
    id: 201,
    speaker: "Shreyas Iyer",
    role: "Engineering Lead",
    timestamp: "00:01:05",
    text: "Rate limiting rollout starts Monday; auth service gets a 2-day read-only freeze.",
  },
  {
    id: 202,
    speaker: "Harin Shah",
    role: "Executive",
    timestamp: "00:02:40",
    text: "As long as it doesn't touch the Q3 launch critical path, proceed.",
  },
  {
    id: 203,
    speaker: "Shreyas Iyer",
    role: "Engineering Lead",
    timestamp: "00:03:15",
    text: "It's isolated to the auth service; launch endpoints are untouched.",
  },
];

export const API_DISCORD: ChatMessage[] = [
  {
    id: "77001",
    author: "shreyas",
    role: "engineering",
    channel: "#platform",
    timestamp: "2026-07-27T11:00:00Z",
    text: "Auth freeze confirmed for Monday–Tuesday. Posting the runbook.",
  },
  {
    id: "77002",
    author: "harin",
    role: "executive",
    channel: "#platform",
    timestamp: "2026-07-27T11:20:00Z",
    text: "Approved. Keep it off the launch critical path.",
  },
];

export const API_INSIGHTS: Insight[] = [
  {
    id: "insight_api_0001",
    project_id: "api_hardening",
    source_type: "meeting_transcript",
    source_refs: [
      { channel: "meeting", line_ids: [201, 203], timestamp: "00:01:05" },
    ],
    raw_statement:
      "Rate limiting rollout begins Monday with a 2-day read-only freeze on the auth service, isolated from Q3 launch endpoints.",
    topic: "platform_hardening",
    impact_domains: ["engineering", "executive"],
    framings: {
      engineering:
        "Auth service goes read-only for 2 days starting Monday during the rate-limiting rollout; launch endpoints are unaffected.",
      marketing:
        "No customer-facing impact expected — this is an internal platform change isolated from the Q3 launch.",
      product:
        "Auth service freeze is scoped away from launch-critical endpoints; no roadmap impact expected.",
      executive:
        "Platform hardening proceeds Monday with a contained 2-day freeze — confirmed not to touch the Q3 launch critical path.",
    },
    confidence: 0.93,
    extracted_at: "2026-07-27T11:30:00Z",
  },
  {
    id: "insight_api_0002",
    project_id: "api_hardening",
    source_type: "discord",
    source_refs: [
      { channel: "discord", message_ids: ["77001", "77002"], timestamp: "2026-07-27T11:00:00Z" },
    ],
    raw_statement:
      "Executive sign-off for the auth freeze is conditional on it staying off the Q3 launch critical path.",
    topic: "platform_hardening",
    impact_domains: ["engineering", "executive", "product"],
    framings: {
      engineering:
        "Ship the freeze as scoped — any change to launch-critical endpoints would need re-approval from Harin.",
      marketing:
        "This workstream has executive approval and is walled off from anything customer-facing.",
      product:
        "Approved with a hard boundary: nothing on the launch-critical path is in scope for this freeze.",
      executive:
        "You approved this Monday–Tuesday freeze on the explicit condition it stays isolated from Q3 launch endpoints.",
    },
    confidence: 0.89,
    extracted_at: "2026-07-27T11:30:00Z",
  },
];

export const API_CONFLICTS: ConflictFlag[] = [];
