import type { Role, SessionUser } from "@/lib/types";

export interface AuthUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
  team: string;
  projectIds: string[];
  avatarColor: string;
}

/** Demo-only fixed accounts — 5 roles across 2 teams. Password is "demo" for all. */
export const USERS: AuthUser[] = [
  {
    id: "u_manish",
    username: "manish@company.com",
    password: "demo",
    name: "Manish Rao",
    role: "engineering",
    team: "Backend",
    projectIds: ["q3_launch"],
    avatarColor: "#0f766e",
  },
  {
    id: "u_shreyas",
    username: "shreyas@company.com",
    password: "demo",
    name: "Shreyas Iyer",
    role: "engineering",
    team: "Platform",
    projectIds: ["q3_launch", "api_hardening"],
    avatarColor: "#2563eb",
  },
  {
    id: "u_nathan",
    username: "nathan@company.com",
    password: "demo",
    name: "Nathan Cole",
    role: "marketing",
    team: "Growth",
    projectIds: ["q3_launch"],
    avatarColor: "#c2410c",
  },
  {
    id: "u_abdo",
    username: "abdo@company.com",
    password: "demo",
    name: "Abdo Farouk",
    role: "product",
    team: "Product",
    projectIds: ["q3_launch"],
    avatarColor: "#7c3aed",
  },
  {
    id: "u_harin",
    username: "harin@company.com",
    password: "demo",
    name: "Harin Shah",
    role: "executive",
    team: "Leadership",
    projectIds: ["q3_launch", "api_hardening"],
    avatarColor: "#be123c",
  },
];

export function findUserByCredentials(
  username: string,
  password: string,
): AuthUser | null {
  const user = USERS.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
  );
  if (!user || user.password !== password) return null;
  return user;
}

export function findUserByUsername(username: string): AuthUser | null {
  return USERS.find((u) => u.username === username) ?? null;
}

export function toSessionUser(user: AuthUser): SessionUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    team: user.team,
    projectIds: user.projectIds,
    avatarColor: user.avatarColor,
  };
}

/** Grants a newly created notebook to its creator. In-memory for the process lifetime. */
export function addProjectToUser(username: string, projectId: string): void {
  const user = findUserByUsername(username);
  if (user && !user.projectIds.includes(projectId)) {
    user.projectIds.push(projectId);
  }
}
