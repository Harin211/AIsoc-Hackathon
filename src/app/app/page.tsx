import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { SyncSpaceApp } from "@/components/SyncSpaceApp";
import { listProjects } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AppHome() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const projects = await listProjects(user.projectIds);
  return <SyncSpaceApp user={user} initialProjects={projects} />;
}
