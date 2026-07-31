"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NotebookChat } from "@/components/NotebookChat";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { StudioRail } from "@/components/StudioRail";
import { readJson } from "@/lib/http";
import type {
  ChatCitation,
  ChatTurn,
  ConflictFlag,
  DocumentSource,
  Insight,
  ProjectNotebook,
  ProjectView,
  SessionUser,
  SourceRef,
  StudioTab,
} from "@/lib/types";

export function SyncSpaceApp({
  user,
  initialProjects,
}: {
  user: SessionUser;
  initialProjects: ProjectNotebook[];
}) {
  const [projects, setProjects] = useState<ProjectNotebook[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    initialProjects[0]?.id ?? null,
  );
  const [view, setView] = useState<ProjectView | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [tab, setTab] = useState<StudioTab>("briefing");
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(
    null,
  );
  const [highlightRefs, setHighlightRefs] = useState<SourceRef[]>([]);

  const loadView = useCallback(async (projectId: string) => {
    setViewLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await readJson<{ view: ProjectView; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Failed to load notebook");
      const nextView: ProjectView = data.view;
      setView(nextView);
      setSelectedInsightId(nextView.insights[0]?.id ?? null);
      setHighlightRefs(nextView.insights[0]?.source_refs ?? []);
      setTab("briefing");
    } catch (err) {
      console.error(err);
      setView(null);
    } finally {
      setViewLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on notebook change
    if (activeProjectId) void loadView(activeProjectId);
  }, [activeProjectId, loadView]);

  const selectedInsight = useMemo(
    () => view?.allInsights.find((i) => i.id === selectedInsightId) ?? null,
    [view, selectedInsightId],
  );

  const insightsById = useMemo(() => {
    const map = new Map<string, Insight>();
    view?.allInsights.forEach((i) => map.set(i.id, i));
    return map;
  }, [view]);

  const focusInsight = useCallback((insight: Insight) => {
    setSelectedInsightId(insight.id);
    setHighlightRefs(insight.source_refs);
    setTab("sources");
  }, []);

  const focusConflict = useCallback(
    (conflict: ConflictFlag) => {
      if (!view) return;
      const involved = view.allInsights.filter((i) =>
        conflict.involved_insights.includes(i.id),
      );
      if (involved[0]) {
        setSelectedInsightId(involved[0].id);
        setHighlightRefs(involved.flatMap((i) => i.source_refs));
      }
      setTab("sources");
    },
    [view],
  );

  const handleConflictUpdate = useCallback((conflict: ConflictFlag) => {
    setView((prev) =>
      prev
        ? {
            ...prev,
            conflicts: prev.conflicts.map((c) =>
              c.id === conflict.id ? conflict : c,
            ),
          }
        : prev,
    );
  }, []);

  const handleCitationClick = useCallback(
    (citation: ChatCitation) => {
      const insight = insightsById.get(citation.insightId);
      setSelectedInsightId(citation.insightId);
      setHighlightRefs(
        citation.sourceRefs.length
          ? citation.sourceRefs
          : (insight?.source_refs ?? []),
      );
      setTab("sources");
    },
    [insightsById],
  );

  const handleTurnsAppended = useCallback((turns: ChatTurn[]) => {
    setView((prev) =>
      prev ? { ...prev, chat: [...prev.chat, ...turns] } : prev,
    );
  }, []);

  const handleDocumentUploaded = useCallback((doc: DocumentSource) => {
    setView((prev) =>
      prev ? { ...prev, documents: [...prev.documents, doc] } : prev,
    );
  }, []);

  const handleProcessed = useCallback((nextView: ProjectView) => {
    setView(nextView);
    setSelectedInsightId(nextView.insights[0]?.id ?? null);
    setHighlightRefs(nextView.insights[0]?.source_refs ?? []);
    setTab("radar");
  }, []);

  const handleProjectCreated = useCallback((project: ProjectNotebook) => {
    setProjects((prev) => [...prev, project]);
    setActiveProjectId(project.id);
  }, []);

  return (
    <div className="grid h-screen grid-cols-1 overflow-hidden bg-background text-foreground lg:grid-cols-[280px_1fr_380px]">
      <ProjectSidebar
        user={user}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onProjectCreated={handleProjectCreated}
        view={view}
        onDocumentUploaded={handleDocumentUploaded}
        onProcessed={handleProcessed}
      />

      {!activeProjectId || viewLoading || !view ? (
        <div className="flex items-center justify-center px-8 text-center text-sm text-muted-foreground">
          <p>
            {viewLoading
              ? "Loading notebook…"
              : "Select or create a notebook to begin."}
          </p>
        </div>
      ) : (
        <>
          <NotebookChat
            projectId={activeProjectId}
            project={view.project}
            processed={view.processed}
            turns={view.chat}
            insightsById={insightsById}
            onTurnsAppended={handleTurnsAppended}
            onCitationClick={handleCitationClick}
          />
          <StudioRail
            projectId={activeProjectId}
            view={view}
            tab={tab}
            onTabChange={setTab}
            selectedInsightId={selectedInsightId}
            highlightRefs={highlightRefs}
            selectedInsight={selectedInsight}
            onSelectInsight={(insight) => {
              setSelectedInsightId(insight.id);
              setHighlightRefs(insight.source_refs);
            }}
            onProveInsight={focusInsight}
            onConflictFocus={focusConflict}
            onConflictUpdate={handleConflictUpdate}
          />
        </>
      )}
    </div>
  );
}
