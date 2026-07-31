"use client";

import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { Maximize2, RefreshCw } from "lucide-react";
import { readJson } from "@/lib/http";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Insight } from "@/lib/types";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "IBM Plex Sans, sans-serif",
});

export function MermaidPanel({
  projectId,
  insights,
}: {
  projectId: string;
  insights: Insight[];
}) {
  const [diagram, setDiagram] = useState<string>("");
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/mermaid`, {
        method: "POST",
      });
      const data = await readJson<{ mermaid: string; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Failed");
      setDiagram(data.mermaid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mermaid failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on projectId change
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    async function render() {
      if (!diagram) return;
      try {
        const id = `syncspace-${Date.now()}`;
        const { svg: rendered } = await mermaid.render(id, diagram);
        setSvg(rendered);
        // Auto-open the enlarged view as soon as a fresh diagram is ready.
        setOpen(true);
      } catch {
        setSvg(
          `<pre class="whitespace-pre-wrap text-xs">${diagram
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</pre>`,
        );
      }
    }
    void render();
  }, [diagram]);

  return (
    <>
      <section className="flex flex-col gap-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Decision flowchart</h2>
            <p className="text-sm text-muted-foreground">
              Visualize how this notebook&rsquo;s decisions connect.
            </p>
          </div>
        </header>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void load()}
            className="gap-1.5"
          >
            <RefreshCw className={loading ? "size-3.5 animate-spin" : "size-3.5"} />
            {loading ? "Generating…" : "Regenerate"}
          </Button>
          {svg && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(true)}
              className="gap-1.5"
            >
              <Maximize2 className="size-3.5" />
              Expand
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Anchored to {insights.length} insights in the project notebook.
        </p>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decision flowchart</DialogTitle>
            <DialogDescription>
              How this notebook&rsquo;s decisions connect.
            </DialogDescription>
          </DialogHeader>
          <div
            className="mermaid-surface min-h-0 flex-1"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
