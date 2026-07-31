"use client";

import { motion, type Variants } from "motion/react";
import { FileText, FileType2, Mic, MessageSquare, Captions } from "lucide-react";

const SOURCES: { name: string; icon: typeof Mic }[] = [
  { name: "Meeting transcripts", icon: Mic },
  { name: "Slack & Discord", icon: MessageSquare },
  { name: "Markdown & text", icon: FileText },
  { name: "Word docs", icon: FileType2 },
  { name: "Captions (.vtt)", icon: Captions },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LogoCloud() {
  return (
    <section id="integrations" className="mx-auto max-w-6xl px-6 py-10">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        Works with the tools your team already uses
      </motion.p>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="mt-6 flex flex-wrap items-center justify-center gap-4"
      >
        {SOURCES.map(({ name, icon: Icon }) => (
          <motion.div
            key={name}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground"
          >
            <Icon className="size-4 text-primary" />
            {name}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
