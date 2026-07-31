export type Role = "engineering" | "marketing" | "executive";
export type SourceType = "meeting_transcript" | "discord" | "slack";
export type ConflictType = "explicit_contradiction" | "possible_mismatch";
export type ConflictStatus = "open" | "confirmed" | "dismissed";

export interface SourceRef {
  channel: "meeting" | "discord" | "slack";
  line_ids?: number[];
  message_ids?: string[];
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

export interface ProjectNotebook {
  id: string;
  name: string;
  description: string;
}

export interface InsightStore {
  project: ProjectNotebook;
  insights: Insight[];
  conflicts: ConflictFlag[];
  transcript: TranscriptLine[];
  discord: ChatMessage[];
  processed: boolean;
  lastProcessedAt: string | null;
}

export type StudioTab = "briefing" | "radar" | "sources" | "visual" | "audio";
