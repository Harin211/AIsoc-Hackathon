import {
  CURATED_CONFLICTS,
  CURATED_INSIGHTS,
  DEMO_PROJECT,
} from "@/lib/demo/curated";
import { DEMO_DISCORD } from "@/lib/demo/discord";
import { DEMO_TRANSCRIPT } from "@/lib/demo/transcript";
import type {
  ConflictFlag,
  ConflictStatus,
  Insight,
  InsightStore,
} from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var __syncspaceStore: InsightStore | undefined;
}

function emptyStore(): InsightStore {
  return {
    project: DEMO_PROJECT,
    insights: [],
    conflicts: [],
    transcript: DEMO_TRANSCRIPT,
    discord: DEMO_DISCORD,
    processed: false,
    lastProcessedAt: null,
  };
}

export function getStore(): InsightStore {
  if (!globalThis.__syncspaceStore) {
    globalThis.__syncspaceStore = emptyStore();
  }
  return globalThis.__syncspaceStore;
}

export function resetStore(): InsightStore {
  globalThis.__syncspaceStore = emptyStore();
  return globalThis.__syncspaceStore;
}

export function setProcessed(
  insights: Insight[],
  conflicts: ConflictFlag[],
): InsightStore {
  const store = getStore();
  store.insights = insights;
  store.conflicts = conflicts;
  store.processed = true;
  store.lastProcessedAt = new Date().toISOString();
  return store;
}

export function loadCuratedDemo(): InsightStore {
  return setProcessed(
    structuredClone(CURATED_INSIGHTS),
    structuredClone(CURATED_CONFLICTS),
  );
}

export function updateConflictStatus(
  id: string,
  status: ConflictStatus,
): ConflictFlag | null {
  const store = getStore();
  const conflict = store.conflicts.find((c) => c.id === id);
  if (!conflict) return null;
  conflict.status = status;
  return conflict;
}

export function upsertInsightFramings(
  id: string,
  framings: Insight["framings"],
): Insight | null {
  const store = getStore();
  const insight = store.insights.find((i) => i.id === id);
  if (!insight) return null;
  insight.framings = { ...insight.framings, ...framings };
  return insight;
}
