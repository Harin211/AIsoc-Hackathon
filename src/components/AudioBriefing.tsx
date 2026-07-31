"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { readJson } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Role } from "@/lib/types";

interface TtsResponse {
  script?: string;
  fallbackScript?: string;
  mode?: string;
  detail?: string;
  audioBase64?: string;
  mimeType?: string;
  error?: string;
}

export function AudioBriefing({
  projectId,
  role,
}: {
  projectId: string;
  role: Role;
}) {
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setDetail(null);
    try {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);

      const res = await fetch(`/api/projects/${projectId}/tts`, {
        method: "POST",
      });
      const data = await readJson<TtsResponse>(res);
      if (!res.ok) throw new Error(data.error || "TTS failed");

      setScript(data.script || data.fallbackScript || "");
      setMode(data.mode ?? null);
      setDetail(data.detail ?? null);

      if (data.audioBase64) {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: data.mimeType || "audio/mpeg" });
        setAudioUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      setDetail(err instanceof Error ? err.message : "TTS failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Audio briefing</h2>
          <p className="text-sm text-muted-foreground">
            Podcast-style narration of the {role} text briefing. Opens with
            alignment risk when flags are open.
          </p>
        </div>
        <Button
          size="sm"
          disabled={loading}
          onClick={() => void generate()}
          className="shrink-0 gap-1.5"
        >
          <Volume2 className="size-3.5" />
          {loading ? "Synthesizing…" : "Generate audio"}
        </Button>
      </header>

      {script && (
        <Card className="border border-border/60 bg-card/60 p-3.5 text-sm italic text-muted-foreground">
          {script}
        </Card>
      )}

      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full" />
      ) : (
        script && (
          <p className="text-sm text-primary">
            {mode === "script_only"
              ? detail || "Script ready. Audio narration isn't configured yet."
              : detail}
          </p>
        )
      )}

      <p className="text-xs text-muted-foreground">
        Audio narration runs in non-commercial mode by default.
      </p>
    </section>
  );
}
