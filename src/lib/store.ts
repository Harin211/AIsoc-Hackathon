import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { chatTurns, projects, userProjects } from "@/lib/db/schema";
import type {
  ChatTurn,
  ConflictFlag,
  ConflictStatus,
  DocumentSource,
  Insight,
  Project,
  ProjectState,
} from "@/lib/types";

type ProjectRow = typeof projects.$inferSelect;

function toProjectState(row: ProjectRow): ProjectState {
  return {
    project: { id: row.id, name: row.name, description: row.description },
    transcript: row.transcript,
    discord: row.discord,
    documents: row.documents,
    insights: row.insights,
    conflicts: row.conflicts,
    processed: row.processed,
    lastProcessedAt: row.lastProcessedAt?.toISOString() ?? null,
  };
}

export async function listProjects(projectIds: string[]): Promise<Project[]> {
  if (!projectIds.length) return [];
  const db = getDb();
  const rows = await db.select().from(projects);
  const byId = new Map(rows.map((r) => [r.id, r]));
  return projectIds
    .map((id) => byId.get(id))
    .filter((r): r is ProjectRow => Boolean(r))
    .map((r) => ({ id: r.id, name: r.name, description: r.description }));
}

export async function getProjectState(
  projectId: string,
): Promise<ProjectState | null> {
  const [row] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return row ? toProjectState(row) : null;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || "project";
}

export async function createProject(name: string): Promise<ProjectState> {
  const db = getDb();
  const base = slugify(name);

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = attempt === 0 ? base : `${base}_${Math.random().toString(36).slice(2, 6)}`;
    const [row] = await db
      .insert(projects)
      .values({ id, name, description: "" })
      .onConflictDoNothing()
      .returning();
    if (row) return toProjectState(row);
  }

  throw new Error("Could not allocate a unique project id");
}

export async function addDocument(
  projectId: string,
  doc: DocumentSource,
): Promise<ProjectState | null> {
  const db = getDb();
  const [row] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!row) return null;

  const documents = [...row.documents, doc];
  // New sources invalidate the Insight Store — chat stays locked until re-process.
  const [updated] = await db
    .update(projects)
    .set({ documents, processed: false, lastProcessedAt: null })
    .where(eq(projects.id, projectId))
    .returning();
  return updated ? toProjectState(updated) : null;
}

export async function setProcessed(
  projectId: string,
  insights: Insight[],
  conflicts: ConflictFlag[],
): Promise<ProjectState | null> {
  const [row] = await getDb()
    .update(projects)
    .set({ insights, conflicts, processed: true, lastProcessedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();
  return row ? toProjectState(row) : null;
}

export async function updateConflictStatus(
  projectId: string,
  conflictId: string,
  status: ConflictStatus,
): Promise<ConflictFlag | null> {
  const db = getDb();
  const [row] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!row) return null;

  const conflict = row.conflicts.find((c) => c.id === conflictId);
  if (!conflict) return null;

  const updatedConflict = { ...conflict, status };
  const conflicts = row.conflicts.map((c) => (c.id === conflictId ? updatedConflict : c));
  await db.update(projects).set({ conflicts }).where(eq(projects.id, projectId));
  return updatedConflict;
}

export async function upsertInsightFramings(
  projectId: string,
  insightId: string,
  framings: Insight["framings"],
): Promise<Insight | null> {
  const db = getDb();
  const [row] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!row) return null;

  const insight = row.insights.find((i) => i.id === insightId);
  if (!insight) return null;

  const updatedInsight = { ...insight, framings: { ...insight.framings, ...framings } };
  const insights = row.insights.map((i) => (i.id === insightId ? updatedInsight : i));
  await db.update(projects).set({ insights }).where(eq(projects.id, projectId));
  return updatedInsight;
}

/** Chat is private per user — every read/write is scoped to (projectId, userId). */
export async function getChatTurns(
  projectId: string,
  userId: string,
): Promise<ChatTurn[]> {
  const rows = await getDb()
    .select()
    .from(chatTurns)
    .where(and(eq(chatTurns.projectId, projectId), eq(chatTurns.userId, userId)))
    .orderBy(asc(chatTurns.createdAt));

  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    content: r.content,
    citations: r.citations ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function appendChatTurn(
  projectId: string,
  userId: string,
  turn: ChatTurn,
): Promise<void> {
  await getDb().insert(chatTurns).values({
    id: turn.id,
    projectId,
    userId,
    role: turn.role,
    content: turn.content,
    citations: turn.citations ?? null,
    createdAt: new Date(turn.createdAt),
  });
}

export async function userHasProjectAccess(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const [row] = await getDb()
    .select({ projectId: userProjects.projectId })
    .from(userProjects)
    .where(and(eq(userProjects.userId, userId), eq(userProjects.projectId, projectId)))
    .limit(1);
  return Boolean(row);
}
