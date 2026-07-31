"use client";

import { AlignmentRadar } from "@/components/AlignmentRadar";
import { AudioBriefing } from "@/components/AudioBriefing";
import { InsightBriefing } from "@/components/InsightBriefing";
import { MermaidPanel } from "@/components/MermaidPanel";
import { SourceViewer } from "@/components/SourceViewer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ConflictFlag,
  Insight,
  ProjectView,
  SourceRef,
  StudioTab,
} from "@/lib/types";

const TABS: { id: StudioTab; label: string }[] = [
  { id: "briefing", label: "Text briefing" },
  { id: "radar", label: "Alignment Radar" },
  { id: "sources", label: "Sources" },
  { id: "visual", label: "Decision flow" },
  { id: "audio", label: "Audio briefing" },
];

export function StudioRail({
  projectId,
  view,
  tab,
  onTabChange,
  selectedInsightId,
  highlightRefs,
  selectedInsight,
  onSelectInsight,
  onProveInsight,
  onConflictFocus,
  onConflictUpdate,
}: {
  projectId: string;
  view: ProjectView;
  tab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  selectedInsightId: string | null;
  highlightRefs: SourceRef[];
  selectedInsight: Insight | null;
  onSelectInsight: (insight: Insight) => void;
  onProveInsight: (insight: Insight) => void;
  onConflictFocus: (conflict: ConflictFlag) => void;
  onConflictUpdate: (conflict: ConflictFlag) => void;
}) {
  const openFlags = view.conflicts.filter((c) => c.status === "open").length;
  const activeTabLabel = TABS.find((t) => t.id === tab)?.label ?? "";

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-t border-border/60 bg-sidebar lg:border-t-0 lg:border-l">
      <nav
        aria-label="Mistral Studio"
        className="flex flex-wrap gap-1 border-b border-border/60 p-2"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            disabled={!view.processed && id !== "sources"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
              tab === id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {label}
            {id === "radar" && openFlags > 0 && (
              <Badge variant="destructive" className="h-4 min-w-4 px-1 text-[10px]">
                {openFlags}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-4">
        {!view.processed && tab !== "sources" ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            <p>Process this notebook to unlock {activeTabLabel.toLowerCase()}.</p>
          </div>
        ) : (
          <>
            {tab === "briefing" && (
              <InsightBriefing
                insights={view.insights}
                role={view.viewerRole}
                selectedId={selectedInsightId}
                onSelect={onSelectInsight}
                onProve={onProveInsight}
              />
            )}
            {tab === "radar" && (
              <AlignmentRadar
                projectId={projectId}
                conflicts={view.conflicts}
                insights={view.allInsights}
                onFocus={onConflictFocus}
                onUpdate={onConflictUpdate}
              />
            )}
            {tab === "sources" && (
              <SourceViewer
                transcript={view.transcript}
                discord={view.discord}
                documents={view.documents}
                highlightRefs={highlightRefs}
                selectedInsight={selectedInsight}
              />
            )}
            {tab === "visual" && (
              <MermaidPanel projectId={projectId} insights={view.insights} />
            )}
            {tab === "audio" && (
              <AudioBriefing projectId={projectId} role={view.viewerRole} />
            )}
          </>
        )}
      </div>
    </aside>
  );
}
