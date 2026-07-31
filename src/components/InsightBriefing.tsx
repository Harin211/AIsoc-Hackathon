"use client";

import type { Insight, Role } from "@/lib/types";

const ROLE_TITLE: Record<Role, string> = {
  engineering: "Engineering briefing",
  marketing: "Marketing / PM briefing",
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
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Mistral Studio · Text</p>
          <h2>{ROLE_TITLE[role]}</h2>
          <p className="panel-lede">
            Framed for this reader from the same cached Insight Store — facts
            pinned, jargon translated.
          </p>
        </div>
      </header>

      <ul className="briefing-list">
        {insights.map((insight) => {
          const framing =
            insight.framings[role] || insight.raw_statement;
          const active = selectedId === insight.id;
          return (
            <li key={insight.id}>
              <div
                className={active ? "briefing-item active" : "briefing-item"}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(insight)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(insight);
                }}
              >
                <div className="briefing-top">
                  <span className="tag">{insight.topic}</span>
                  <span className="conf">
                    {Math.round(insight.confidence * 100)}% conf
                  </span>
                </div>
                <p className="briefing-text">{framing}</p>
                <p className="briefing-raw">
                  Source fact: {insight.raw_statement}
                </p>
                <div className="briefing-actions">
                  <span className="domains">
                    {insight.impact_domains.join(" · ")}
                  </span>
                  <button
                    type="button"
                    className="prove-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProve(insight);
                    }}
                  >
                    Click to source →
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
