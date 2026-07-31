"use client";

import { useEffect, useMemo } from "react";
import type {
  ChatMessage,
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

export function SourceViewer({
  transcript,
  discord,
  highlightRefs,
  selectedInsight,
}: {
  transcript: TranscriptLine[];
  discord: ChatMessage[];
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

  useEffect(() => {
    const firstLine = [...meetingHits][0];
    const firstMsg = [...discordHits][0];
    const el =
      (firstLine != null && document.getElementById(`line-${firstLine}`)) ||
      (firstMsg != null && document.getElementById(`msg-${firstMsg}`));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [meetingHits, discordHits]);

  return (
    <section className="panel sources-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Provenance</p>
          <h2>Click-to-source</h2>
          <p className="panel-lede">
            Highlights come from <code>source_refs</code> on the Insight — not
            fragile text re-matching.
            {selectedInsight
              ? ` Showing refs for ${selectedInsight.id}.`
              : " Select an insight to highlight origins."}
          </p>
        </div>
      </header>

      <div className="sources-grid">
        <div className="source-col">
          <h3>Meeting · 14 Jul 2026</h3>
          <div className="source-scroll">
            {transcript.map((line) => {
              const hit =
                meetingHits.has(line.id) ||
                lineHighlighted(line.id, highlightRefs);
              return (
                <div
                  key={line.id}
                  id={`line-${line.id}`}
                  className={hit ? "source-line hit" : "source-line"}
                >
                  <span className="ts">{line.timestamp}</span>
                  <div>
                    <strong>
                      {line.speaker}{" "}
                      <em className="role-em">{line.role}</em>
                    </strong>
                    <p>{line.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="source-col">
          <h3>Discord · pre-loaded log</h3>
          <div className="source-scroll">
            {discord.map((msg) => {
              const hit =
                discordHits.has(msg.id) ||
                msgHighlighted(msg.id, highlightRefs);
              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={hit ? "source-line hit" : "source-line"}
                >
                  <span className="ts">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                  <div>
                    <strong>
                      @{msg.author}{" "}
                      <em className="role-em">
                        {msg.channel} · {msg.role}
                      </em>
                    </strong>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
