"use client";

import { AlertTriangle, CheckCircle2, RotateCcw, X } from "lucide-react";
import { readJson } from "@/lib/http";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ConflictFlag, Insight } from "@/lib/types";

const STATUS_STYLE: Record<ConflictFlag["status"], string> = {
  open: "border-destructive/50 bg-destructive/5",
  confirmed: "border-amber-500/40 bg-amber-500/5",
  dismissed: "border-border/60 bg-muted/30 opacity-70",
};

export function AlignmentRadar({
  projectId,
  conflicts,
  insights,
  onFocus,
  onUpdate,
}: {
  projectId: string;
  conflicts: ConflictFlag[];
  insights: Insight[];
  onFocus: (conflict: ConflictFlag) => void;
  onUpdate: (conflict: ConflictFlag) => void;
}) {
  async function setStatus(
    conflict: ConflictFlag,
    status: ConflictFlag["status"],
  ) {
    try {
      const res = await fetch(`/api/projects/${projectId}/conflicts/${conflict.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await readJson<{ conflict: ConflictFlag; error?: string }>(res);
      if (res.ok) onUpdate(data.conflict);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update conflict");
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Alignment Radar
        </p>
        <h2 className="font-display text-lg font-semibold">Cross-channel contradictions</h2>
        <p className="text-sm text-muted-foreground">
          Contradictions and mismatches across sources.
        </p>
      </header>

      {conflicts.length === 0 && (
        <p className="text-sm italic text-muted-foreground">
          No alignment gaps detected for this role yet.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {conflicts.map((conflict) => {
          const involved = insights.filter((i) =>
            conflict.involved_insights.includes(i.id),
          );
          return (
            <Card
              key={conflict.id}
              className={cn("gap-3 border p-3.5", STATUS_STYLE[conflict.status])}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="gap-1 capitalize">
                  <AlertTriangle className="size-3" />
                  {conflict.type.replace("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(conflict.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm">{conflict.description}</p>
              <div className="flex flex-col gap-1.5">
                {involved.map((insight) => (
                  <div
                    key={insight.id}
                    className="rounded-md bg-muted/40 px-2.5 py-1.5 text-xs"
                  >
                    <strong className="mr-1.5 font-medium text-foreground">
                      {insight.id}
                    </strong>
                    <span className="text-muted-foreground">{insight.raw_statement}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => onFocus(conflict)}>
                  Trace sources
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setStatus(conflict, "confirmed")}
                >
                  <CheckCircle2 className="size-3.5" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setStatus(conflict, "dismissed")}
                >
                  <X className="size-3.5" />
                  Dismiss
                </Button>
                {conflict.status !== "open" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setStatus(conflict, "open")}
                  >
                    <RotateCcw className="size-3.5" />
                    Reopen
                  </Button>
                )}
                <Badge className="ml-auto capitalize">{conflict.status}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
