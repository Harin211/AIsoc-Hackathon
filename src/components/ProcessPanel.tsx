"use client";

import type { InsightStore } from "@/lib/types";

export function ProcessPanel({
  busy,
  setBusy,
  processed,
  lastProcessedAt,
  statusNote,
  onProcessed,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  processed: boolean;
  lastProcessedAt: string | null;
  statusNote: string | null;
  onProcessed: (store: InsightStore, note: string) => void;
}) {
  async function run(forceCurated = false) {
    setBusy(true);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceCurated, reset: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Process failed");
      onProcessed(data.store, data.note);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Process failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="process-panel">
      <p className="rail-heading">Ingestion</p>
      <p className="process-copy">
        Pre-loaded meeting transcript + Discord log. Same pipeline as live
        connectors — no stage-network fragility.
      </p>
      <button
        type="button"
        className="primary-btn"
        disabled={busy}
        onClick={() => run(false)}
      >
        {busy ? "Processing…" : processed ? "Re-process Now" : "Process Now"}
      </button>
      <button
        type="button"
        className="ghost-btn"
        disabled={busy}
        onClick={() => run(true)}
      >
        Load curated demo
      </button>
      {lastProcessedAt && (
        <p className="process-meta">
          Cached {new Date(lastProcessedAt).toLocaleString()}
        </p>
      )}
      {statusNote && <p className="process-note">{statusNote}</p>}
    </div>
  );
}
