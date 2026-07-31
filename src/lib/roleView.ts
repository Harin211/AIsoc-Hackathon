import type {
  ChatTurn,
  ConflictFlag,
  Insight,
  ProjectState,
  ProjectView,
  Role,
} from "@/lib/types";

/** Insights relevant to `role`; falls back to the full set if none match. */
export function visibleInsightsForRole(insights: Insight[], role: Role): Insight[] {
  const matching = insights.filter((i) => i.impact_domains.includes(role));
  return matching.length ? matching : insights;
}

/** Conflicts that touch at least one currently-visible insight. */
export function visibleConflictsForRole(
  conflicts: ConflictFlag[],
  visibleInsightIds: ReadonlySet<string>,
): ConflictFlag[] {
  return conflicts.filter((c) =>
    c.involved_insights.some((id) => visibleInsightIds.has(id)),
  );
}

export function buildProjectView(
  state: ProjectState,
  role: Role,
  chat: ChatTurn[],
): ProjectView {
  const insights = visibleInsightsForRole(state.insights, role);
  const conflicts = visibleConflictsForRole(
    state.conflicts,
    new Set(insights.map((i) => i.id)),
  );

  return {
    project: state.project,
    transcript: state.transcript,
    discord: state.discord,
    documents: state.documents,
    insights,
    allInsights: state.insights,
    conflicts,
    chat,
    processed: state.processed,
    lastProcessedAt: state.lastProcessedAt,
    viewerRole: role,
  };
}
