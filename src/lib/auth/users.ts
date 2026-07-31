import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { userProjects, users } from "@/lib/db/schema";
import type { Role, SessionUser } from "@/lib/types";

const PASSWORD_HASH_ROUNDS = 12;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  team: string;
  avatarColor: string;
  projectIds: string[];
}

type UserRow = typeof users.$inferSelect;

function toAuthUser(row: UserRow, projectIds: string[]): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as Role,
    team: row.team,
    avatarColor: row.avatarColor,
    projectIds,
  };
}

async function loadProjectIds(userId: string): Promise<string[]> {
  const rows = await getDb()
    .select({ projectId: userProjects.projectId })
    .from(userProjects)
    .where(eq(userProjects.userId, userId));
  return rows.map((r) => r.projectId);
}

async function findRowByEmail(email: string): Promise<UserRow | null> {
  const [row] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function findUserByCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const row = await findRowByEmail(email);
  if (!row) return null;
  const valid = await bcrypt.compare(password, row.passwordHash);
  if (!valid) return null;
  return toAuthUser(row, await loadProjectIds(row.id));
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const [row] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!row) return null;
  return toAuthUser(row, await loadProjectIds(row.id));
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const row = await findRowByEmail(email);
  if (!row) return null;
  return toAuthUser(row, await loadProjectIds(row.id));
}

/** Verifies `currentPassword` and stores a new hashed password for `userId`. */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [row] = await getDb().select().from(users).where(eq(users.id, userId)).limit(1);
  if (!row) return { ok: false, error: "User not found" };

  const valid = await bcrypt.compare(currentPassword, row.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect" };

  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters" };
  }

  const passwordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS);
  await getDb().update(users).set({ passwordHash }).where(eq(users.id, userId));
  return { ok: true };
}

export function toSessionUser(user: AuthUser): SessionUser {
  return {
    id: user.id,
    username: user.email,
    name: user.name,
    role: user.role,
    team: user.team,
    projectIds: user.projectIds,
    avatarColor: user.avatarColor,
  };
}

/** Grants a newly created project to its creator. */
export async function addProjectToUser(
  userId: string,
  projectId: string,
): Promise<void> {
  await getDb()
    .insert(userProjects)
    .values({ userId, projectId })
    .onConflictDoNothing();
}

export { PASSWORD_HASH_ROUNDS };
