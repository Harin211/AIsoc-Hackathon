import {
  boolean,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  ChatCitation,
  ChatMessage,
  ConflictFlag,
  DocumentSource,
  Insight,
  Role,
  TranscriptLine,
} from "@/lib/types";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").$type<Role>().notNull(),
  team: text("team").notNull(),
  avatarColor: text("avatar_color").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  transcript: jsonb("transcript").$type<TranscriptLine[]>().notNull().default([]),
  discord: jsonb("discord").$type<ChatMessage[]>().notNull().default([]),
  documents: jsonb("documents").$type<DocumentSource[]>().notNull().default([]),
  insights: jsonb("insights").$type<Insight[]>().notNull().default([]),
  conflicts: jsonb("conflicts").$type<ConflictFlag[]>().notNull().default([]),
  processed: boolean("processed").notNull().default(false),
  lastProcessedAt: timestamp("last_processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Join table replacing the old flat `projectIds` array on each user. */
export const userProjects = pgTable(
  "user_projects",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.projectId] })],
);

/** Scoped by (project_id, user_id) so each person has a private conversation. */
export const chatTurns = pgTable("chat_turns", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations").$type<ChatCitation[]>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
