# SyncSpace

Workspace-driven, role-aware AI platform for the [AIsoc Hackathon](https://github.com/Harin211/AIsoc-Hackathon).

A NotebookLM-style three-pane workspace: pick a notebook on the left, chat with it (grounded, with citations) in the center, and open role-filtered Studio panels — Text briefing, Alignment Radar, Sources, Decision flow, Audio briefing — on the right. Every panel re-renders from one cached, verified **Insight Store** instead of re-querying the model.

**Eligibility:** all inference runs on Mistral (Embed, Large 3 / Structured Output, Small framing pass, Voxtral TTS). Discord/Slack are data connectors only.

## Quick start

```bash
npm install
cp .env.example .env.local
# add MISTRAL_API_KEY=...  (optional VOXTRAL_VOICE_ID=...)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on `/login`.

Without an API key, **Process notebook** / **Load curated demo** still runs the full UI off a curated Insight Store that matches the live schema — useful for rehearsing the pitch on `Q3 Launch`.

## Demo logins

Five fixed accounts across two teams — **password is `demo`** for all of them (also selectable with one click from the login screen):

| Username | Role | Team | Notebooks |
|---|---|---|---|
| `marcus` | Engineering | Backend | Q3 Launch |
| `devon` | Engineering | Platform | Q3 Launch, API Hardening |
| `priya` | Marketing | Growth | Q3 Launch |
| `ava` | Product | Product | Q3 Launch |
| `jordan` | Executive | Leadership | Q3 Launch, API Hardening |

Role is locked to the account — there's no free role switcher. Text/Audio briefings and Alignment Radar filter to insights where `impact_domains` includes your role (falling back to the full set if none match); chat frames its answer at your role's altitude and always cites the insights it used.

## Demo narrative

1. **Login as `jordan`** — sees both notebooks. Open `Q3 Launch`, hit **Process notebook** (or **Load curated demo** if you don't have an API key handy). Alignment Radar flags the September‑15‑vs‑Q4 contradiction with a confidence score.
2. **Ask the chat** — "Is the September 15 launch date still safe?" The assistant answers grounded in the Insight Store and cites the specific insights it used; click a citation chip to jump to Sources with the exact transcript line / Discord message highlighted.
3. **Login as `marcus`** or **`priya`** — same notebook, but the Text briefing, Radar, and Audio briefing are now framed and filtered for engineering / marketing.
4. **Login as `priya`**, create a notebook, upload a `.md`/`.txt`/`.docx`/`.pdf`/`.vtt` source, and process it — the same Mistral pipeline runs against your own content.

## Architecture

```
Transcript + Discord + Uploaded documents
                      →  Notebook (hard RAG boundary via Embed)
                      →  Mistral Large 3 Structured Output (Insight extraction, once)
                      →  Insight Store (cached JSON, per notebook)
                            ├─ Alignment Radar (dedicated diff pass)
                            ├─ Jargon Translator (role/seniority framing)
                            ├─ Grounded chat (Embed retrieval + Large 3 answer + citations)
                            ├─ Text / Mermaid / Voxtral TTS re-renders (role-filtered)
                            └─ source_refs → click-to-highlight provenance (incl. uploaded docs)
```

Expensive extraction runs **once** per notebook. Downstream artifacts — briefings, radar, Mermaid, audio, chat — are cheap re-renders or retrievals off the same record.

## File uploads

Supported: `.md`, `.txt`, `.vtt` (WebVTT captions), `.pdf`, `.docx` — 5 MB max per file. PDFs/DOCX are best-effort text extraction; `.txt`/`.md`/`.vtt` are the most reliable path for a live demo. Uploaded documents become a first-class source alongside the transcript/chat log, with the same line-level provenance.

## Auth model

Demo-grade only, by design: 5 hardcoded accounts (`src/lib/auth/users.ts`), an HMAC-signed cookie session (no external auth provider or database), and `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) gating every route. This is intentionally out of scope for a hackathon — see the `Skip / simplify` section of the build plan.

## MVP map

| Priority | Feature | Status |
|---|---|---|
| 1 | Structured JSON extraction + `impact_domains` + `source_refs` | ✅ |
| 2 | Jargon Translator (facts pinned) | ✅ |
| 3 | Alignment Radar + confidence + dismiss/confirm | ✅ |
| 4 | Text briefing per role, role-filtered | ✅ |
| 5 | Source attribution UI (transcript + chat + documents) | ✅ |
| 6 | Mermaid decision flowchart | ✅ |
| 7 | Voxtral TTS audio, role-filtered | ✅ (needs `VOXTRAL_VOICE_ID`) |
| 8 | Multi-project notebooks + demo login | ✅ |
| 9 | File upload ingestion (md/txt/pdf/docx/vtt) | ✅ |
| 10 | Grounded center chat with citations | ✅ |
| 11 | Live Discord/Slack | Demo uses pre-loaded log + Process notebook |

**Out of scope:** generative video, live streaming on stage, real OAuth/DB-backed auth.

## Env

| Variable | Purpose |
|---|---|
| `MISTRAL_API_KEY` | All inference |
| `VOXTRAL_VOICE_ID` | Saved voice in Mistral Studio for `/v1/audio/speech` |
| `SESSION_SECRET` | Optional — HMAC secret for the demo session cookie (falls back to a fixed dev value) |

Voxtral TTS is non-commercial by default — fine for the hackathon; production needs a separate agreement.

## Scripts

- `npm run dev` — local demo
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
