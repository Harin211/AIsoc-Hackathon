"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileUp, LogOut, Plus, Radar } from "lucide-react";
import { readJson } from "@/lib/http";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  DocumentSource,
  Project,
  ProjectView,
  SessionUser,
} from "@/lib/types";

const ROLE_LABEL: Record<SessionUser["role"], string> = {
  engineering: "Engineering",
  marketing: "Marketing",
  product: "Product",
  executive: "Executive",
};

export function ProjectSidebar({
  user,
  projects,
  activeProjectId,
  onSelectProject,
  onProjectCreated,
  view,
  onDocumentUploaded,
  onProcessed,
}: {
  user: SessionUser;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onProjectCreated: (project: Project) => void;
  view: ProjectView | null;
  onDocumentUploaded: (doc: DocumentSource) => void;
  onProcessed: (view: ProjectView, note: string) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProjectName, setNewProjectName] = useState("");
  const [creatingBusy, setCreatingBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processBusy, setProcessBusy] = useState(false);
  const [processNote, setProcessNote] = useState<string | null>(null);

  async function createProject(e: FormEvent) {
    e.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;
    setCreatingBusy(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await readJson<{ project: Project; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Could not create project");
      onProjectCreated(data.project);
      setNewProjectName("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setCreatingBusy(false);
    }
  }

  async function uploadFile(file: File) {
    if (!activeProjectId) return;
    setUploadBusy(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/projects/${activeProjectId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await readJson<{ document: DocumentSource; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onDocumentUploaded(data.document);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function process() {
    if (!activeProjectId) return;
    setProcessBusy(true);
    setProcessNote(null);
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await readJson<{ view: ProjectView; note: string; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Process failed");
      onProcessed(data.view, data.note);
      setProcessNote(data.note);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Process failed");
    } finally {
      setProcessBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-b border-border/60 bg-sidebar text-sidebar-foreground lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 px-5 pt-5">
        <Radar className="size-5 text-primary" />
        <p className="font-display text-base font-semibold leading-none">SyncSpace</p>
      </div>

      <div className="mx-4 mt-5 flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3">
        <Avatar>
          <AvatarFallback style={{ backgroundColor: user.avatarColor, color: "#0a0d18" }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user.team} · {ROLE_LABEL[user.role]}
          </p>
        </div>
        <ChangePasswordDialog />
        <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-2 px-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Projects
        </p>
        <ul className="flex flex-col gap-1">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelectProject(p.id)}
                className={cn(
                  "flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activeProjectId === p.id
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <strong className="font-medium">{p.name}</strong>
              </button>
            </li>
          ))}
        </ul>
        <form className="mt-1 flex gap-2" onSubmit={createProject}>
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New project name"
            disabled={creatingBusy}
            className="h-9"
          />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            disabled={creatingBusy || !newProjectName.trim()}
            aria-label="Create project"
          >
            <Plus className="size-4" />
          </Button>
        </form>
      </div>

      {view && (
        <div className="mt-6 flex flex-col gap-2 px-4 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sources
          </p>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {view.transcript.length > 0 && (
              <li>Meeting transcript · {view.transcript.length} lines</li>
            )}
            {view.discord.length > 0 && <li>Chat log · {view.discord.length} messages</li>}
            {view.documents.map((doc) => (
              <li key={doc.id} title={doc.filename} className="truncate">
                {doc.filename}
              </li>
            ))}
            {view.transcript.length === 0 &&
              view.discord.length === 0 &&
              view.documents.length === 0 && (
                <li className="italic text-muted-foreground/70">
                  No sources yet — upload one below.
                </li>
              )}
          </ul>

          <label
            className={cn(
              "mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
              uploadBusy && "pointer-events-none opacity-60",
            )}
          >
            <FileUp className="size-4" />
            {uploadBusy ? "Uploading…" : "Upload source"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.docx,.pdf,.vtt"
              hidden
              disabled={uploadBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
              }}
            />
          </label>
          <p className="text-center text-xs text-muted-foreground/70">
            .md · .txt · .docx · .pdf · .vtt (max 5 MB)
          </p>
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

          <Button className="mt-2" disabled={processBusy} onClick={() => void process()}>
            {processBusy
              ? "Processing…"
              : view.processed
                ? "Re-process project"
                : "Process project"}
          </Button>

          {view.lastProcessedAt && (
            <p className="mt-1 text-center text-xs text-muted-foreground/70">
              Cached {new Date(view.lastProcessedAt).toLocaleString()}
            </p>
          )}
          {processNote && (
            <p className="text-center text-xs text-primary">{processNote}</p>
          )}
        </div>
      )}
    </aside>
  );
}
