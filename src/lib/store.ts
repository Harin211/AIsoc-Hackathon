import {
  API_CONFLICTS,
  API_DISCORD,
  API_INSIGHTS,
  API_TRANSCRIPT,
  DEMO_PROJECT_API,
} from "@/lib/demo/apiHardening";
import { DEMO_PROJECT } from "@/lib/demo/curated";
import { DEMO_DISCORD } from "@/lib/demo/discord";
import { DEMO_TRANSCRIPT } from "@/lib/demo/transcript";
import type {
  ChatTurn,
  ConflictFlag,
  ConflictStatus,
  DocumentSource,
  Insight,
  ProjectNotebook,
  ProjectState,
} from "@/lib/types";

declare global {
  var __syncspaceProjects: Map<string, ProjectState> | undefined;
}

function emptyProjectState(project: ProjectNotebook): ProjectState {
  return {
    project,
    transcript: [],
    discord: [],
    documents: [],
    insights: [],
    conflicts: [],
    chat: [],
    processed: false,
    lastProcessedAt: null,
  };
}

function buildInitialProjects(): Map<string, ProjectState> {
  const map = new Map<string, ProjectState>();

  map.set(DEMO_PROJECT.id, {
    project: DEMO_PROJECT,
    transcript: DEMO_TRANSCRIPT,
    discord: DEMO_DISCORD,
    documents: [],
    insights: [],
    conflicts: [],
    chat: [],
    processed: false,
    lastProcessedAt: null,
  });

  // Ships pre-processed so the demo narrative works without a Mistral call.
  map.set(DEMO_PROJECT_API.id, {
    project: DEMO_PROJECT_API,
    transcript: API_TRANSCRIPT,
    discord: API_DISCORD,
    documents: [],
    insights: structuredClone(API_INSIGHTS),
    conflicts: structuredClone(API_CONFLICTS),
    chat: [],
    processed: true,
    lastProcessedAt: "2026-07-27T11:30:00Z",
  });

  return map;
}

function getProjects(): Map<string, ProjectState> {
  if (!globalThis.__syncspaceProjects) {
    globalThis.__syncspaceProjects = buildInitialProjects();
  }
  return globalThis.__syncspaceProjects;
}

export function listProjects(projectIds: string[]): ProjectNotebook[] {
  const projects = getProjects();
  return projectIds
    .map((id) => projects.get(id)?.project)
    .filter((p): p is ProjectNotebook => Boolean(p));
}

export function getProjectState(projectId: string): ProjectState | null {
  return getProjects().get(projectId) ?? null;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || "notebook";
}

export function createProject(name: string): ProjectState {
  const projects = getProjects();
  let id = slugify(name);
  if (projects.has(id)) {
    id = `${id}_${Math.random().toString(36).slice(2, 6)}`;
  }
  const state = emptyProjectState({ id, name, description: "" });
  projects.set(id, state);
  return state;
}

export function addDocument(
  projectId: string,
  doc: DocumentSource,
): ProjectState | null {
  const state = getProjectState(projectId);
  if (!state) return null;
  state.documents.push(doc);
  return state;
}

export function setProcessed(
  projectId: string,
  insights: Insight[],
  conflicts: ConflictFlag[],
): ProjectState | null {
  const state = getProjectState(projectId);
  if (!state) return null;
  state.insights = insights;
  state.conflicts = conflicts;
  state.processed = true;
  state.lastProcessedAt = new Date().toISOString();
  return state;
}

export function updateConflictStatus(
  projectId: string,
  conflictId: string,
  status: ConflictStatus,
): ConflictFlag | null {
  const state = getProjectState(projectId);
  if (!state) return null;
  const conflict = state.conflicts.find((c) => c.id === conflictId);
  if (!conflict) return null;
  conflict.status = status;
  return conflict;
}

export function upsertInsightFramings(
  projectId: string,
  insightId: string,
  framings: Insight["framings"],
): Insight | null {
  const state = getProjectState(projectId);
  if (!state) return null;
  const insight = state.insights.find((i) => i.id === insightId);
  if (!insight) return null;
  insight.framings = { ...insight.framings, ...framings };
  return insight;
}

export function appendChatTurn(
  projectId: string,
  turn: ChatTurn,
): ProjectState | null {
  const state = getProjectState(projectId);
  if (!state) return null;
  state.chat.push(turn);
  return state;
}
