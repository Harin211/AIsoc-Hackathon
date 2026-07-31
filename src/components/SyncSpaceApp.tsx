"use client";

import { useCallback, useMemo, useState } from "react";
import { AlignmentRadar } from "@/components/AlignmentRadar";
import { AudioBriefing } from "@/components/AudioBriefing";
import { InsightBriefing } from "@/components/InsightBriefing";
import { MermaidPanel } from "@/components/MermaidPanel";
import { ProcessPanel } from "@/components/ProcessPanel";
import { RoleSelector } from "@/components/RoleSelector";
import { SourceViewer } from "@/components/SourceViewer";
import type {
  ConflictFlag,
  Insight,
  InsightStore,
  Role,
  SourceRef,
  StudioTab,
} from "@/lib/types";

const EMPTY: InsightStore = {
  project: {
    id: "q3_launch",
    name: "Q3 Launch",
    description: "",
  },
  insights: [],
  conflicts: [],
  transcript: [],
  discord: [],
  processed: false,
  lastProcessedAt: null,
};

export function SyncSpaceApp({ initial }: { initial: InsightStore }) {
  const [store, setStore] = useState<InsightStore>(initial ?? EMPTY);
  const [role, setRole] = useState<Role>("executive");
  const [tab, setTab] = useState<StudioTab>("briefing");
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(
    null,
  );
  const [highlightRefs, setHighlightRefs] = useState<SourceRef[]>([]);
  const [busy, setBusy] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const selectedInsight = useMemo(
    () => store.insights.find((i) => i.id === selectedInsightId) ?? null,
    [store.insights, selectedInsightId],
  );

  const focusInsight = useCallback((insight: Insight) => {
    setSelectedInsightId(insight.id);
    setHighlightRefs(insight.source_refs);
    setTab("sources");
  }, []);

  const focusConflict = useCallback(
    (conflict: ConflictFlag) => {
      const first = store.insights.find((i) =>
        conflict.involved_insights.includes(i.id),
      );
      if (first) {
        setSelectedInsightId(first.id);
        const refs = store.insights
          .filter((i) => conflict.involved_insights.includes(i.id))
          .flatMap((i) => i.source_refs);
        setHighlightRefs(refs);
      }
      setTab("sources");
    },
    [store.insights],
  );

  const onProcessed = useCallback((next: InsightStore, note: string) => {
    setStore(next);
    setStatusNote(note);
    setSelectedInsightId(next.insights[0]?.id ?? null);
    setHighlightRefs(next.insights[0]?.source_refs ?? []);
    setTab("radar");
  }, []);

  const onConflictUpdate = useCallback((conflict: ConflictFlag) => {
    setStore((prev) => ({
      ...prev,
      conflicts: prev.conflicts.map((c) =>
        c.id === conflict.id ? conflict : c,
      ),
    }));
  }, []);

  const openFlags = store.conflicts.filter((c) => c.status === "open").length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="brand">SyncSpace</p>
          <p className="brand-sub">Verified truth · role-aware delivery</p>
        </div>
        <div className="project-chip">
          <span className="project-label">Notebook</span>
          <strong>{store.project.name}</strong>
          <span className="project-id">{store.project.id}</span>
        </div>
        <RoleSelector value={role} onChange={setRole} />
      </header>

      <div className="workspace">
        <aside className="rail">
          <ProcessPanel
            busy={busy}
            setBusy={setBusy}
            processed={store.processed}
            lastProcessedAt={store.lastProcessedAt}
            statusNote={statusNote}
            onProcessed={onProcessed}
          />

          <nav className="studio-nav" aria-label="Mistral Studio">
            {(
              [
                ["briefing", "Text briefing"],
                ["radar", `Alignment Radar${openFlags ? ` (${openFlags})` : ""}`],
                ["sources", "Sources"],
                ["visual", "Decision flow"],
                ["audio", "Audio briefing"],
              ] as [StudioTab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={tab === id ? "nav-btn active" : "nav-btn"}
                onClick={() => setTab(id)}
                disabled={!store.processed && id !== "sources"}
              >
                {label}
              </button>
            ))}
          </nav>

          {store.processed && (
            <div className="insight-list">
              <p className="rail-heading">Insight Store</p>
              {store.insights.map((insight) => (
                <button
                  key={insight.id}
                  type="button"
                  className={
                    selectedInsightId === insight.id
                      ? "insight-item active"
                      : "insight-item"
                  }
                  onClick={() => {
                    setSelectedInsightId(insight.id);
                    setHighlightRefs(insight.source_refs);
                  }}
                >
                  <span className="insight-topic">{insight.topic}</span>
                  <span className="insight-raw">{insight.raw_statement}</span>
                  <span className="insight-meta">
                    {insight.impact_domains.join(" · ")} ·{" "}
                    {Math.round(insight.confidence * 100)}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="stage">
          {!store.processed ? (
            <div className="empty-stage">
              <h1>Same meeting. Three understandings. One record.</h1>
              <p>
                Load the July 14 transcript and the July 29 Discord log, then run
                extraction once. Every role briefing, conflict flag, Mermaid
                node, and audio line re-renders from that cached Insight Store.
              </p>
              <ol>
                <li>PM locks September 15 in the room.</li>
                <li>Engineering quietly slips dependent APIs to Q4 in Discord.</li>
                <li>Alignment Radar surfaces the gap before the deadline does.</li>
              </ol>
            </div>
          ) : (
            <>
              {tab === "briefing" && (
                <InsightBriefing
                  insights={store.insights}
                  role={role}
                  selectedId={selectedInsightId}
                  onSelect={(insight) => {
                    setSelectedInsightId(insight.id);
                    setHighlightRefs(insight.source_refs);
                  }}
                  onProve={focusInsight}
                />
              )}
              {tab === "radar" && (
                <AlignmentRadar
                  conflicts={store.conflicts}
                  insights={store.insights}
                  onFocus={focusConflict}
                  onUpdate={onConflictUpdate}
                />
              )}
              {tab === "sources" && (
                <SourceViewer
                  transcript={store.transcript}
                  discord={store.discord}
                  highlightRefs={highlightRefs}
                  selectedInsight={selectedInsight}
                />
              )}
              {tab === "visual" && (
                <MermaidPanel insights={store.insights} />
              )}
              {tab === "audio" && <AudioBriefing role={role} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
