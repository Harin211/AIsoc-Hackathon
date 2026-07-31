"use client";

import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  ChatMessage,
  DocumentSource,
  Insight,
  SourceRef,
  TranscriptLine,
} from "@/lib/types";

function lineHighlighted(lineId: number, refs: SourceRef[]): boolean {
  return refs.some(
    (r) => r.channel === "meeting" && r.line_ids?.includes(lineId),
  );
}

function msgHighlighted(messageId: string, refs: SourceRef[]): boolean {
  return refs.some(
    (r) => r.channel === "discord" && r.message_ids?.includes(messageId),
  );
}

function docLineHighlighted(
  documentId: string,
  lineId: number,
  refs: SourceRef[],
): boolean {
  return refs.some(
    (r) =>
      r.channel === "document" &&
      r.document_id === documentId &&
      r.line_ids?.includes(lineId),
  );
}

const sourceLineClass = (hit: boolean) =>
  cn(
    "flex gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
    hit ? "bg-primary/15 ring-1 ring-primary/40" : "hover:bg-muted/40",
  );

export function SourceViewer({
  transcript,
  discord,
  documents,
  highlightRefs,
  selectedInsight,
}: {
  transcript: TranscriptLine[];
  discord: ChatMessage[];
  documents: DocumentSource[];
  highlightRefs: SourceRef[];
  selectedInsight: Insight | null;
}) {
  const meetingHits = useMemo(
    () =>
      new Set(
        highlightRefs.flatMap((r) =>
          r.channel === "meeting" ? (r.line_ids ?? []) : [],
        ),
      ),
    [highlightRefs],
  );

  const discordHits = useMemo(
    () =>
      new Set(
        highlightRefs.flatMap((r) =>
          r.channel === "discord" ? (r.message_ids ?? []) : [],
        ),
      ),
    [highlightRefs],
  );

  const documentHitKeys = useMemo(
    () =>
      new Set(
        highlightRefs.flatMap((r) =>
          r.channel === "document" && r.document_id
            ? (r.line_ids ?? []).map((lineId) => `${r.document_id}:${lineId}`)
            : [],
        ),
      ),
    [highlightRefs],
  );

  useEffect(() => {
    const firstLine = [...meetingHits][0];
    const firstMsg = [...discordHits][0];
    const firstDocKey = [...documentHitKeys][0];
    const el =
      (firstLine != null && document.getElementById(`line-${firstLine}`)) ||
      (firstMsg != null && document.getElementById(`msg-${firstMsg}`)) ||
      (firstDocKey != null &&
        document.getElementById(`doc-${firstDocKey.replace(":", "-")}`));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [meetingHits, discordHits, documentHitKeys]);

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Provenance
        </p>
        <h2 className="font-display text-lg font-semibold">Click-to-source</h2>
        <p className="text-sm text-muted-foreground">
          See exactly where each insight came from.
          {selectedInsight ? "" : " Select an insight to highlight its origin."}
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Meeting transcript</h3>
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-lg border border-border/60 p-2">
            {transcript.length === 0 && (
              <p className="p-2 text-sm italic text-muted-foreground">
                No meeting transcript yet.
              </p>
            )}
            {transcript.map((line) => {
              const hit =
                meetingHits.has(line.id) ||
                lineHighlighted(line.id, highlightRefs);
              return (
                <div key={line.id} id={`line-${line.id}`} className={sourceLineClass(hit)}>
                  <span className="w-14 shrink-0 text-xs text-muted-foreground">
                    {line.timestamp}
                  </span>
                  <div>
                    <strong className="text-sm">
                      {line.speaker}{" "}
                      <em className="font-normal text-muted-foreground">{line.role}</em>
                    </strong>
                    <p className="text-sm text-muted-foreground">{line.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Chat log</h3>
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-lg border border-border/60 p-2">
            {discord.length === 0 && (
              <p className="p-2 text-sm italic text-muted-foreground">No chat log yet.</p>
            )}
            {discord.map((msg) => {
              const hit =
                discordHits.has(msg.id) || msgHighlighted(msg.id, highlightRefs);
              return (
                <div key={msg.id} id={`msg-${msg.id}`} className={sourceLineClass(hit)}>
                  <span className="w-14 shrink-0 text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <div>
                    <strong className="text-sm">
                      @{msg.author}{" "}
                      <em className="font-normal text-muted-foreground">
                        {msg.channel} · {msg.role}
                      </em>
                    </strong>
                    <p className="text-sm text-muted-foreground">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {documents.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Uploaded documents</h3>
            <div className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-lg border border-border/60 p-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex flex-col gap-1">
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {doc.filename}
                  </p>
                  {doc.lines.map((line) => {
                    const key = `${doc.id}:${line.id}`;
                    const hit =
                      documentHitKeys.has(key) ||
                      docLineHighlighted(doc.id, line.id, highlightRefs);
                    return (
                      <div
                        key={key}
                        id={`doc-${doc.id}-${line.id}`}
                        className={sourceLineClass(hit)}
                      >
                        <span className="w-10 shrink-0 text-xs text-muted-foreground">
                          L{line.id}
                        </span>
                        <p className="text-sm text-muted-foreground">{line.text}</p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
