"use client";

import { useState } from "react";
import type { Role } from "@/lib/types";

export function AudioBriefing({ role }: { role: Role }) {
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

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "TTS failed");

      setScript(data.script || data.fallbackScript || "");
      setMode(data.mode);
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
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Mistral Studio · Audio</p>
          <h2>Voxtral briefing</h2>
          <p className="panel-lede">
            Podcast-style narration of the {role} text briefing. Opens with
            alignment risk when flags are open.
          </p>
        </div>
        <button
          type="button"
          className="primary-btn"
          disabled={loading}
          onClick={() => void generate()}
        >
          {loading ? "Synthesizing…" : "Generate audio"}
        </button>
      </header>

      {script && (
        <blockquote className="audio-script">
          <p>{script}</p>
        </blockquote>
      )}

      {audioUrl ? (
        <audio controls src={audioUrl} className="audio-player" />
      ) : (
        script && (
          <p className="process-note">
            {mode === "script_only"
              ? detail ||
                "Script ready. Configure VOXTRAL_VOICE_ID for Voxtral playback."
              : detail}
          </p>
        )
      )}

      <p className="panel-foot">
        Voxtral TTS is non-commercial by default — fine for the hackathon demo;
        production needs a separate Mistral agreement.
      </p>
    </section>
  );
}
