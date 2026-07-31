# SyncSpace

Workspace-driven, role-aware AI platform for the [AIsoc Hackathon](https://github.com/Harin211/AIsoc-Hackathon).

A three-pane workspace: pick a project on the left, chat with it (grounded, with citations) in the center, and open role-filtered Studio panels — Text briefing, Alignment Radar, Sources, Decision flow, Audio briefing — on the right. Every panel re-renders from one cached, verified **Insight Store** instead of re-querying the model.

**Eligibility:** all inference runs on Mistral (Embed, Large 3 / Structured Output, Small framing pass, Voxtral TTS). Discord/Slack are data connectors only.

## Quick start

SyncSpace stores accounts and projects in Postgres — grab a free connection string from [Supabase](https://supabase.com) or [Neon](https://neon.tech) (or point `DATABASE_URL` at any Postgres instance) before running it locally. In Supabase: **Project Settings → Database → Connection string**.

```bash
npm install
cp .env.example .env.local
# fill in MISTRAL_API_KEY, DATABASE_URL, SESSION_SECRET (optional VOXTRAL_VOICE_ID)
npm run db:migrate   # creates the users/projects/chat_turns tables
npm run db:seed      # creates the 5 accounts + seeds the two demo projects
npm run dev
```

`db:seed` prints each account's freshly generated password once to the console — save it, it isn't stored anywhere else. Re-running `db:seed` is safe; it skips accounts/projects that already exist.

Open [http://localhost:4300](http://localhost:4300) — you'll land on `/login`.

Without a `MISTRAL_API_KEY`, **Process project** still runs the full UI off a cached reference Insight Store that matches the live schema — useful for rehearsing the pitch on `Q3 Launch`.

## Accounts

Five real accounts across two teams, seeded by `npm run db:seed`:

| Email | Role | Team | Projects |
|---|---|---|---|
| `manish@company.com` | Engineering | Backend | Q3 Launch |
| `shreyas@company.com` | Engineering | Platform | Q3 Launch, API Hardening |
| `nathan@company.com` | Marketing | Growth | Q3 Launch |
| `abdo@company.com` | Product | Product | Q3 Launch |
| `harin@company.com` | Executive | Leadership | Q3 Launch, API Hardening |

Passwords are bcrypt-hashed and private per account — each person can change theirs from the key icon next to their profile in the sidebar. Role is locked to the account — there's no free role switcher. Text/Audio briefings and Alignment Radar filter to insights where `impact_domains` includes your role (falling back to the full set if none match); chat frames its answer at your role's altitude, always cites the insights it used, and is private to the signed-in user.

## Demo narrative

1. **Login as `harin@company.com`** — sees both projects. Open `Q3 Launch`, hit **Process project**. Alignment Radar flags the September‑15‑vs‑Q4 contradiction with a confidence score.
2. **Ask the chat** — "Is the September 15 launch date still safe?" The assistant answers grounded in the Insight Store and cites the specific insights it used; click a citation chip to jump to Sources with the exact transcript line / Discord message highlighted.
3. **Login as `manish@company.com`** or **`nathan@company.com`** — same project, but the Text briefing, Radar, and Audio briefing are now framed and filtered for engineering / marketing.
4. **Login as `nathan@company.com`**, create a project, upload a `.md`/`.txt`/`.docx`/`.pdf`/`.vtt` source, and process it — the same Mistral pipeline runs against your own content.

## Architecture

```
Transcript + Discord + Uploaded documents
                      →  Project (hard RAG boundary via Embed)
                      →  Mistral Large 3 Structured Output (Insight extraction, once)
                      →  Insight Store (cached JSON, per project)
                            ├─ Alignment Radar (dedicated diff pass)
                            ├─ Jargon Translator (role/seniority framing)
                            ├─ Grounded chat (Embed retrieval + Large 3 answer + citations)
                            ├─ Text / Mermaid / Voxtral TTS re-renders (role-filtered)
                            └─ source_refs → click-to-highlight provenance (incl. uploaded docs)
```

Expensive extraction runs **once** per project. Downstream artifacts — briefings, radar, Mermaid, audio, chat — are cheap re-renders or retrievals off the same record.

## File uploads

Supported: `.md`, `.txt`, `.vtt` (WebVTT captions), `.pdf`, `.docx` — 5 MB max per file. PDFs/DOCX are best-effort text extraction; `.txt`/`.md`/`.vtt` are the most reliable path for a live demo. Uploaded documents become a first-class source alongside the transcript/chat log, with the same line-level provenance.

## Auth model

5 real Postgres-backed accounts (`src/lib/db/schema.ts` / `src/lib/auth/users.ts`) with bcrypt-hashed passwords, an HMAC-signed cookie session keyed on the account's database id, and `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) gating every route. Chat history is private per `(project, user)` pair. There's no open signup — accounts are provisioned via `npm run db:seed` and each person sets their own password from the sidebar after first login.

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
| 8 | Multi-project workspaces + login | ✅ |
| 9 | File upload ingestion (md/txt/pdf/docx/vtt) | ✅ |
| 10 | Grounded center chat with citations | ✅ |
| 11 | Live Discord/Slack | Demo uses pre-loaded log + Process project |

**Out of scope:** generative video, live streaming on stage.

## Env

| Variable | Purpose |
|---|---|
| `MISTRAL_API_KEY` | All inference |
| `DATABASE_URL` | Postgres connection string (Supabase, Neon, or otherwise) |
| `SESSION_SECRET` | HMAC secret for signing the session cookie — **required** in production |
| `VOXTRAL_VOICE_ID` | Optional — saved voice in Mistral Studio for `/v1/audio/speech` |

Voxtral TTS is non-commercial by default — production needs a separate agreement.

## Scripts

- `npm run dev` — local dev server (port 4300)
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
- `npm run db:generate` — generate a new Drizzle migration after editing `src/lib/db/schema.ts`
- `npm run db:migrate` — apply pending migrations to `DATABASE_URL`
- `npm run db:studio` — browse the database in Drizzle Studio
- `npm run db:seed` — create the 5 accounts (prints initial passwords once) + seed the demo projects

## Deploying (Vercel)

1. Create a Postgres database — [Supabase](https://supabase.com) or [Neon](https://neon.tech) free tiers both work well with Vercel's serverless functions. On Supabase, use the **Transaction pooler** connection string (port 6543) for serverless deploys.
2. Import the repo into Vercel and set these project env vars: `MISTRAL_API_KEY`, `DATABASE_URL`, `SESSION_SECRET` (generate with `openssl rand -hex 32`), and optionally `VOXTRAL_VOICE_ID`.
3. Before or after the first deploy, run the migration and seed once against the production database:
   ```bash
   DATABASE_URL=<production connection string> npm run db:migrate
   DATABASE_URL=<production connection string> npm run db:seed
   ```
4. Share the printed initial passwords with each person out-of-band; they can change them from the sidebar after logging in.
