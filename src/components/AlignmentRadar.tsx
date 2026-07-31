"use client";

import type { ConflictFlag, Insight } from "@/lib/types";

export function AlignmentRadar({
  conflicts,
  insights,
  onFocus,
  onUpdate,
}: {
  conflicts: ConflictFlag[];
  insights: Insight[];
  onFocus: (conflict: ConflictFlag) => void;
  onUpdate: (conflict: ConflictFlag) => void;
}) {
  async function setStatus(
    conflict: ConflictFlag,
    status: ConflictFlag["status"],
  ) {
    const res = await fetch(`/api/conflicts/${conflict.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) onUpdate(data.conflict);
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Alignment Radar</p>
          <h2>Cross-channel contradictions</h2>
          <p className="panel-lede">
            Dedicated diff pass over the Insight Store — not bundled into
            extraction. Confidence labels ship from day one.
          </p>
        </div>
      </header>

      <div className="radar-grid">
        {conflicts.map((conflict) => {
          const involved = insights.filter((i) =>
            conflict.involved_insights.includes(i.id),
          );
          return (
            <article
              key={conflict.id}
              className={`radar-card status-${conflict.status}`}
            >
              <div className="radar-top">
                <span className={`badge ${conflict.type}`}>
                  {conflict.type.replace("_", " ")}
                </span>
                <span className="conf">
                  {Math.round(conflict.confidence * 100)}% confidence
                </span>
              </div>
              <p className="radar-desc">{conflict.description}</p>
              <div className="radar-insights">
                {involved.map((insight) => (
                  <div key={insight.id} className="radar-insight">
                    <strong>{insight.id}</strong>
                    <span>{insight.raw_statement}</span>
                  </div>
                ))}
              </div>
              <div className="radar-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => onFocus(conflict)}
                >
                  Trace sources
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setStatus(conflict, "confirmed")}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setStatus(conflict, "dismissed")}
                >
                  Dismiss
                </button>
                {conflict.status !== "open" && (
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setStatus(conflict, "open")}
                  >
                    Reopen
                  </button>
                )}
                <span className="status-pill">{conflict.status}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
