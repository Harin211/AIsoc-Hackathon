"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Insight, Role } from "@/lib/types";

const ROLE_TITLE: Record<Role, string> = {
  engineering: "Engineering briefing",
  marketing: "Marketing / PM briefing",
  product: "Product briefing",
  executive: "Executive briefing",
};

export function InsightBriefing({
  insights,
  role,
  selectedId,
  onSelect,
  onProve,
}: {
  insights: Insight[];
  role: Role;
  selectedId: string | null;
  onSelect: (insight: Insight) => void;
  onProve: (insight: Insight) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="font-display text-lg font-semibold">{ROLE_TITLE[role]}</h2>
        <p className="text-sm text-muted-foreground">
          Key facts, framed for your role.
        </p>
      </header>

      {insights.length === 0 && (
        <p className="text-sm italic text-muted-foreground">
          No insights extracted from this project yet.
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {insights.map((insight) => {
          const framing = insight.framings[role] || insight.raw_statement;
          const active = selectedId === insight.id;
          return (
            <li key={insight.id}>
              <Card
                role="button"
                tabIndex={0}
                onClick={() => onSelect(insight)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(insight);
                }}
                className={cn(
                  "cursor-pointer gap-2.5 border p-3.5 transition-colors",
                  active
                    ? "border-primary/60 bg-primary/10"
                    : "border-border/60 bg-card/60 hover:border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{insight.topic}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(insight.confidence * 100)}% conf
                  </span>
                </div>
                <p className="text-sm">{framing}</p>
                <p className="text-xs text-muted-foreground">
                  Source fact: {insight.raw_statement}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {insight.impact_domains.join(" · ")}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProve(insight);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Click to source
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
