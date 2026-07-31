"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { readJson } from "@/lib/http";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatCitation, ChatTurn, Insight, ProjectNotebook } from "@/lib/types";

export function NotebookChat({
  projectId,
  project,
  processed,
  turns,
  insightsById,
  onTurnsAppended,
  onCitationClick,
}: {
  projectId: string;
  project: ProjectNotebook;
  processed: boolean;
  turns: ChatTurn[];
  insightsById: Map<string, Insight>;
  onTurnsAppended: (turns: ChatTurn[]) => void;
  onCitationClick: (citation: ChatCitation) => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, pendingUserMessage]);

  async function send() {
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    setMessage("");
    setPendingUserMessage(text);
    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await readJson<{ userTurn: ChatTurn; assistantTurn: ChatTurn; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Chat failed");
      onTurnsAppended([data.userTurn, data.assistantTurn]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
      setMessage(text);
    } finally {
      setPendingUserMessage(null);
      setSending(false);
    }
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="flex flex-col gap-1 border-b border-border/60 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Notebook</p>
        <h1 className="font-display text-xl font-semibold">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          Ask anything — every answer is cited.
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        {turns.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            {processed ? (
              <p>
                Ask a question about {project.name} — e.g. &ldquo;Is the launch
                date still on track?&rdquo;
              </p>
            ) : (
              <p>Process this notebook from the left sidebar to unlock grounded chat.</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={cn("flex flex-col gap-1.5", turn.role === "user" ? "items-end" : "items-start")}
            >
              <p
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  turn.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-card text-card-foreground",
                )}
              >
                {turn.content}
              </p>
              {turn.citations && turn.citations.length > 0 && (
                <div className="flex max-w-[80%] flex-wrap gap-1.5">
                  {turn.citations.map((citation) => {
                    const insight = insightsById.get(citation.insightId);
                    return (
                      <button
                        key={citation.insightId}
                        type="button"
                        onClick={() => onCitationClick(citation)}
                      >
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/70">
                          {insight?.topic ?? citation.insightId}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {pendingUserMessage && (
            <div className="flex flex-col items-end gap-1.5">
              <p className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                {pendingUserMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="px-6 text-sm text-destructive">{error}</p>}

      <form
        className="flex items-center gap-2 border-t border-border/60 px-6 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={processed ? "Ask this notebook…" : "Process the notebook to chat"}
          disabled={!processed || sending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!processed || sending || !message.trim()}
          aria-label="Send message"
        >
          <SendHorizonal className="size-4" />
        </Button>
      </form>
    </main>
  );
}
