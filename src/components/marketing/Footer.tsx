"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrbBackground from "@/components/decor/orb-background";

export default function Footer() {
  return (
    <footer className="relative isolate mx-auto max-w-6xl overflow-hidden px-6 pb-16">
      <div className="relative overflow-hidden rounded-4xl border border-border/60 bg-card/60">
        <OrbBackground className="opacity-70" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center gap-6 px-8 py-16 text-center"
        >
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Stop scrolling back through threads for the truth
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Sign in and see role-aware briefings, Alignment Radar, and
            grounded chat on a real project in under a minute.
          </p>
          <Button size="lg" render={<Link href="/login" />}>
            Start for free
          </Button>
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-4 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-foreground">
          <Radar className="size-4 text-primary" />
          SyncSpace
        </Link>
        <p>© {new Date().getFullYear()} SyncSpace.</p>
      </div>
    </footer>
  );
}
