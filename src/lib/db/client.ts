import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __syncspaceDb: Database | undefined;
}

/**
 * Lazy singleton — only connects (and only requires DATABASE_URL) on first
 * real query. Works against any standard Postgres (Supabase, Neon, etc.).
 * `prepare: false` is required when connecting through a pgbouncer-style
 * transaction pooler (e.g. Supabase's port-6543 pooled connection string).
 */
export function getDb(): Database {
  if (!globalThis.__syncspaceDb) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set — see .env.example and the README's Deploying section.",
      );
    }
    const client = postgres(url, { prepare: false });
    globalThis.__syncspaceDb = drizzle(client, { schema });
  }
  return globalThis.__syncspaceDb;
}
