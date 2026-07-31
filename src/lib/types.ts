export type Role = "engineering" | "marketing" | "product" | "executive";
export type SourceType =
  | "meeting_transcript"
  | "discord"
  | "slack"
  | "document";
export type ConflictType = "explicit_contradiction" | "possible_mismatch";
export type ConflictStatus = "open" | "confirmed" | "dismissed";

export interface SourceRef {
  channel: "meeting" | "discord" | "slack" | "document";
  line_ids?: number[];
  message_ids?: string[];
  document_id?: string;
  timestamp: string;
}

export interface Insight {
  id: string;
  project_id: string;
  source_type: SourceType;
  source_refs: SourceRef[];
  raw_statement: string;
  topic: string;
  impact_domains: Role[];
  framings: Partial<Record<Role, string>>;
  confidence: number;
  extracted_at: string;
}

export interface ConflictFlag {
  id: string;
  project_id: string;
  type: ConflictType;
  involved_insights: string[];
  description: string;
  confidence: number;
  status: ConflictStatus;
}

export interface TranscriptLine {
  id: number;
  speaker: string;
  role: string;
  timestamp: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  role: string;
  channel: string;
  timestamp: string;
  text: string;
}

export interface DocumentLine {
  id: number;
  text: string;
}

export interface DocumentSource {
  id: string;
  filename: string;
  mime: string;
  uploadedAt: string;
  uploadedBy: string;
  lines: DocumentLine[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface ChatCitation {
  insightId: string;
  sourceRefs: SourceRef[];
}

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  createdAt: string;
}

/** Server-side persisted state for one project. Chat is per-user, fetched separately. */
export interface ProjectState {
  project: Project;
  transcript: TranscriptLine[];
  discord: ChatMessage[];
  documents: DocumentSource[];
  insights: Insight[];
  conflicts: ConflictFlag[];
  processed: boolean;
  lastProcessedAt: string | null;
}

/** Role-filtered payload sent to the client for the active project. */
export interface ProjectView {
  project: Project;
  transcript: TranscriptLine[];
  discord: ChatMessage[];
  documents: DocumentSource[];
  insights: Insight[];
  allInsights: Insight[];
  conflicts: ConflictFlag[];
  chat: ChatTurn[];
  processed: boolean;
  lastProcessedAt: string | null;
  viewerRole: Role;
}

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  team: string;
  projectIds: string[];
  avatarColor: string;
}

export type StudioTab = "briefing" | "radar" | "sources" | "visual" | "audio";
