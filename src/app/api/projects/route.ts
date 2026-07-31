import { NextResponse } from "next/server";
import { addProjectToUser } from "@/lib/auth/users";
import { getSessionUser } from "@/lib/auth/session";
import { createProject, listProjects } from "@/lib/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ projects: await listProjects(user.projectIds) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Project name required" }, { status: 400 });
  }

  const state = await createProject(name);
  await addProjectToUser(user.id, state.project.id);
  return NextResponse.json({ project: state.project });
}
