"use client";

import { motion } from "motion/react";
import { Link2, Radar, UsersRound } from "lucide-react";
import FeatureCard, { type FeatureCardProps } from "./FeatureCard";

const FEATURES: FeatureCardProps[] = [
  {
    title: "Every answer is provenance-linked",
    description:
      "Grounded chat cites the exact transcript line, chat message, or document it pulled from — click a citation to jump straight to the source.",
    icon: Link2,
  },
  {
    title: "Alignment Radar catches contradictions",
    description:
      "Cross-channel and cross-time conflicts get flagged automatically — before they turn into a launch-day surprise.",
    icon: Radar,
  },
  {
    title: "Briefings, framed for your role",
    description:
      "The same underlying facts, reframed in the right altitude and jargon for engineering, marketing, product, or execs — numbers and dates never change.",
    icon: UsersRound,
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <h2 className="font-display text-3xl font-semibold md:text-4xl">
          One workspace, one verified truth
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          SyncSpace turns scattered meetings, messages, and docs into a single
          cached Insight Store that every teammate can trust — and check.
        </p>
      </motion.div>

      <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
          >
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
