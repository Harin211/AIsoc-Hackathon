"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import type { Insight } from "@/lib/types";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "IBM Plex Sans, sans-serif",
});

export function MermaidPanel({ insights }: { insights: Insight[] }) {
  const [diagram, setDiagram] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mermaid", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDiagram(data.mermaid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mermaid failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function render() {
      if (!diagram || !hostRef.current) return;
      try {
        const id = `syncspace-${Date.now()}`;
        const { svg } = await mermaid.render(id, diagram);
        hostRef.current.innerHTML = svg;
      } catch {
        hostRef.current.innerHTML = `<pre class="mermaid-fallback">${diagram}</pre>`;
      }
    }
    void render();
  }, [diagram]);

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Mistral Studio · Visual</p>
          <h2>Decision flowchart</h2>
          <p className="panel-lede">
            Mermaid syntax from linked Insight chains — rendered client-side.
            Not generative video.
          </p>
        </div>
        <button
          type="button"
          className="ghost-btn"
          disabled={loading}
          onClick={() => void load()}
        >
          {loading ? "Generating…" : "Regenerate"}
        </button>
      </header>

      {error && <p className="error-text">{error}</p>}
      <div className="mermaid-host" ref={hostRef} />
      <p className="panel-foot">
        Anchored to {insights.length} insights in the project notebook.
      </p>
    </section>
  );
}
