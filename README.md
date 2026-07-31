# SyncSpace

Workspace-driven, role-aware AI platform for the [AIsoc Hackathon](https://github.com/Harin211/AIsoc-Hackathon).

Turns meeting transcripts + Discord/Slack chat into one verified **Insight Store**, then re-renders it per role, flags cross-channel contradictions (Alignment Radar), and keeps click-to-source provenance on every claim.

**Eligibility:** all inference runs on Mistral (Embed, Large 3 / Structured Output, Small framing pass, Voxtral TTS). Discord/Slack are data connectors only.

## Quick start

```bash
npm install
cp .env.example .env.local
# add MISTRAL_API_KEY=...  (optional VOXTRAL_VOICE_ID=...)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without an API key, **Process Now** / **Load curated demo** still runs the full UI off a curated Insight Store that matches the live schema — useful for rehearsing the pitch.

## Demo narrative (3 steps)

1. **Cold open** — July 14 meeting: PM locks **September 15** Q3 launch. July 29 Discord `#eng-backend`: engineer casually slips API-dependent work to **Q4**.
2. **Reveal** — hit **Process Now**. Alignment Radar flags the contradiction with confidence. Trace to linked insights → exact transcript lines + Discord messages. Flip Engineer / Marketer / Exec framings of the same facts.
3. **Payoff** — generate the executive **Voxtral** audio briefing (opens with the risk).

## Architecture

```
Transcript + Discord  →  Project Notebook (hard RAG boundary via Embed)
                      →  Mistral Large 3 Structured Output (Insight extraction, once)
                      →  Insight Store (cached JSON)
                            ├─ Alignment Radar (dedicated diff pass)
                            ├─ Jargon Translator (role/seniority framing)
                            ├─ Text / Mermaid / Voxtral TTS re-renders
                            └─ source_refs → click-to-highlight provenance
```

Expensive extraction runs **once** per batch. Downstream artifacts are cheap re-renders off the same record.

## MVP map

| Priority | Feature | Status |
|---|---|---|
| 1 | Structured JSON extraction + `impact_domains` + `source_refs` | ✅ |
| 2 | Jargon Translator (facts pinned) | ✅ |
| 3 | Alignment Radar + confidence + dismiss/confirm | ✅ |
| 4 | Text briefing per role | ✅ |
| 5 | Source attribution UI | ✅ |
| 6 | Mermaid decision flowchart | ✅ |
| 7 | Voxtral TTS audio | ✅ (needs `VOXTRAL_VOICE_ID`) |
| 8 | Live Discord/Slack | Demo uses pre-loaded log + Process Now |

**Out of scope:** generative video, live streaming on stage, heavy auth.

## Env

| Variable | Purpose |
|---|---|
| `MISTRAL_API_KEY` | All inference |
| `VOXTRAL_VOICE_ID` | Saved voice in Mistral Studio for `/v1/audio/speech` |

Voxtral TTS is non-commercial by default — fine for the hackathon; production needs a separate agreement.

## Scripts

- `npm run dev` — local demo
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
