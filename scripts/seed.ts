/**
 * One-time / idempotent seed script.
 *
 *   npm run db:seed
 *
 * Creates the 5 real accounts (if they don't already exist) with a
 * random bcrypt-hashed initial password printed once to the console,
 * and seeds the two demo projects' transcript/discord/insight data.
 * Safe to re-run — existing users/projects are left untouched.
 */
import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../src/lib/db/client";
import { projects, userProjects, users } from "../src/lib/db/schema";
import { API_CONFLICTS, API_DISCORD, API_INSIGHTS, API_TRANSCRIPT, DEMO_PROJECT_API } from "../src/lib/demo/apiHardening";
import { DEMO_PROJECT } from "../src/lib/demo/curated";
import { DEMO_DISCORD } from "../src/lib/demo/discord";
import { DEMO_TRANSCRIPT } from "../src/lib/demo/transcript";
import type { Role } from "../src/lib/types";

const PASSWORD_HASH_ROUNDS = 12;

const ACCOUNTS: {
  email: string;
  name: string;
  role: Role;
  team: string;
  avatarColor: string;
  projectIds: string[];
}[] = [
  {
    email: "manish@company.com",
    name: "Manish Rao",
    role: "engineering",
    team: "Backend",
    avatarColor: "#0f766e",
    projectIds: ["q3_launch"],
  },
  {
    email: "shreyas@company.com",
    name: "Shreyas Iyer",
    role: "engineering",
    team: "Platform",
    avatarColor: "#2563eb",
    projectIds: ["q3_launch", "api_hardening"],
  },
  {
    email: "nathan@company.com",
    name: "Nathan Cole",
    role: "marketing",
    team: "Growth",
    avatarColor: "#c2410c",
    projectIds: ["q3_launch"],
  },
  {
    email: "abdo@company.com",
    name: "Abdo Farouk",
    role: "product",
    team: "Product",
    avatarColor: "#7c3aed",
    projectIds: ["q3_launch"],
  },
  {
    email: "harin@company.com",
    name: "Harin Shah",
    role: "executive",
    team: "Leadership",
    avatarColor: "#be123c",
    projectIds: ["q3_launch", "api_hardening"],
  },
];

function randomPassword(): string {
  return crypto.randomBytes(9).toString("base64url");
}

async function seedProjects() {
  const db = getDb();

  await db
    .insert(projects)
    .values({
      id: DEMO_PROJECT.id,
      name: DEMO_PROJECT.name,
      description: DEMO_PROJECT.description,
      transcript: DEMO_TRANSCRIPT,
      discord: DEMO_DISCORD,
      documents: [],
      insights: [],
      conflicts: [],
      processed: false,
    })
    .onConflictDoNothing();

  await db
    .insert(projects)
    .values({
      id: DEMO_PROJECT_API.id,
      name: DEMO_PROJECT_API.name,
      description: DEMO_PROJECT_API.description,
      transcript: API_TRANSCRIPT,
      discord: API_DISCORD,
      documents: [],
      insights: API_INSIGHTS,
      conflicts: API_CONFLICTS,
      processed: true,
      lastProcessedAt: new Date(),
    })
    .onConflictDoNothing();

  console.log(`Seeded projects: ${DEMO_PROJECT.id}, ${DEMO_PROJECT_API.id}`);
}

async function seedAccounts() {
  const db = getDb();
  const credentials: { email: string; password: string }[] = [];

  for (const account of ACCOUNTS) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, account.email))
      .limit(1);

    let userId: string;

    if (existing) {
      userId = existing.id;
      console.log(`- ${account.email} already exists, leaving password untouched.`);
    } else {
      const password = randomPassword();
      const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
      const [row] = await db
        .insert(users)
        .values({
          email: account.email,
          passwordHash,
          name: account.name,
          role: account.role,
          team: account.team,
          avatarColor: account.avatarColor,
        })
        .returning({ id: users.id });
      userId = row.id;
      credentials.push({ email: account.email, password });
      console.log(`- created ${account.email}`);
    }

    for (const projectId of account.projectIds) {
      await db.insert(userProjects).values({ userId, projectId }).onConflictDoNothing();
    }
  }

  if (credentials.length) {
    console.log("\nInitial passwords — save these now, they will not be shown again:\n");
    for (const c of credentials) {
      console.log(`  ${c.email}  ${c.password}`);
    }
    console.log("\nEach person should sign in and change their password.\n");
  } else {
    console.log("\nAll 5 accounts already existed — no new passwords generated.\n");
  }
}

async function main() {
  await seedProjects();
  await seedAccounts();
  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
