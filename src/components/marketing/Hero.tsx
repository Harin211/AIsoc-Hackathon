"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CheckCircle2, Radar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Beam from "@/components/decor/beam";
import { AnimatedList } from "@/components/decor/animated-list";

const INSIGHT_LINES = [
  { label: "Engineering", text: "Caching fix shipped Tuesday, before the outage window." },
  { label: "Product", text: "Launch date holds — no scope cut confirmed in standup." },
  { label: "Executive", text: "Conflict flagged: marketing timeline vs. eng estimate." },
];

export default function Hero() {
  return (
    <Beam className="mx-auto flex flex-col gap-16 px-6 pt-8 pb-20 md:gap-6 lg:flex-row lg:items-center lg:justify-between lg:pt-16 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex max-w-xl flex-col gap-6"
      >
        <Badge variant="outline" className="w-fit gap-1.5 border-primary/40 text-primary">
          <Sparkles className="size-3" />
          Powered by Mistral
        </Badge>

        <h1 className="font-display text-4xl leading-[1.05] font-semibold sm:text-5xl md:text-6xl">
          Never lose track of what your team actually decided
        </h1>

        <p className="text-lg text-muted-foreground">
          SyncSpace reads every meeting transcript, Slack and Discord thread, and
          uploaded doc — then gives each teammate a role-aware briefing with
          citations back to the exact line it came from.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" render={<Link href="/login" />}>
            Start for free
          </Button>
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            See how it works →
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-md lg:max-w-lg"
      >
        <Card className="relative gap-5 border border-border/60 bg-card/80 p-1 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2 px-4 pt-3 text-xs text-muted-foreground">
            <Radar className="size-3.5 text-primary" />
            Alignment Radar · Q3 Launch
          </div>

          <div className="flex flex-col gap-3 px-4">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/90 px-4 py-2.5 text-sm text-primary-foreground">
              Did we ship the caching fix before the outage?
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm">
              Yes — merged Tuesday 14:02, two days before the incident.
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-3" /> meeting_transcript · L42
                </Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 px-4 py-3">
            <AnimatedList delay={900} className="gap-2">
              {INSIGHT_LINES.map((line) => (
                <div
                  key={line.label}
                  className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs"
                >
                  <Badge className="mt-0.5 shrink-0">{line.label}</Badge>
                  <span className="text-muted-foreground">{line.text}</span>
                </div>
              ))}
            </AnimatedList>
          </div>
        </Card>
      </motion.div>
    </Beam>
  );
}
