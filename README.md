# SyncSpace

**Live:** [https://syncspace-peach.vercel.app](https://syncspace-peach.vercel.app)

SyncSpace is a role-aware knowledge workspace that turns meeting transcripts, team chat, and uploaded documents into one verified **Insight Store**. Teams get grounded, cited answers — not another ungrounded summary.

Built for the [AIsoc Hackathon](https://github.com/Harin211/AIsoc-Hackathon) by:

- Nathan Rebello
- Manish Mahapatra
- Shreyas Pitre
- Harin Vinod
- Abdoali Zakir

## Overview

SyncSpace uses a three-pane workspace:

1. **Projects** — select or create a project and manage sources
2. **Chat** — ask questions grounded in the Insight Store, with clickable citations
3. **Studio** — Text briefing, Alignment Radar, Sources, Decision flow, and Audio briefing

Expensive extraction runs once per project. Downstream views — briefings, radar, Mermaid diagrams, audio, and chat — re-render from the same cached record.

All inference runs on **Mistral** (Embed, Large 3 structured output, Small framing, Voxtral TTS). Discord/Slack are treated as data sources, not model providers.

## Features

| Feature | Description |
|---|---|
| Insight Store | Structured extraction with topics, impact domains, and source references |
| Alignment Radar | Detects contradictions across sources with confidence scores |
| Role-aware delivery | Engineering, marketing, product, and executive framings of the same facts |
| Grounded chat | Embed retrieval + Large 3 answers with citations into source lines |
| Decision flow | Mermaid flowchart generated from linked insights |
| Audio briefing | Role-filtered script via Voxtral TTS |
| File ingestion | `.md`, `.txt`, `.vtt`, `.pdf`, `.docx` (max 5 MB) |
| Multi-user auth | Postgres-backed accounts, bcrypt passwords, private per-user chat |

## Architecture

```
Transcript + Discord + Uploaded documents
                      →  Project (RAG boundary via Embed)
                      →  Mistral Large 3 Structured Output (Insight extraction)
                      →  Insight Store (cached JSON, per project)
                            ├─ Alignment Radar
                            ├─ Jargon Translator (role framing)
                            ├─ Grounded chat (retrieval + citations)
                            ├─ Text / Mermaid / Voxtral TTS (role-filtered)
                            └─ source_refs → click-to-highlight provenance
```

## Stack

- **Frontend / API:** Next.js (App Router)
- **Inference:** Mistral AI
- **Database:** Supabase (Postgres) via Drizzle ORM
- **Auth:** bcrypt-hashed credentials + HMAC-signed session cookies
- **Hosting:** Vercel — [syncspace-peach.vercel.app](https://syncspace-peach.vercel.app)

## Local development

Requirements: Node.js 20+, a Postgres database (Supabase recommended), and a Mistral API key.

```bash
npm install
cp .env.example .env.local
# Set MISTRAL_API_KEY, DATABASE_URL, SESSION_SECRET
# Optional: VOXTRAL_VOICE_ID

npm run db:migrate
npm run db:seed
npm run dev
```

`db:seed` creates the seeded accounts and demo projects, and prints initial passwords once. Re-running seed is safe: existing rows are left unchanged.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MISTRAL_API_KEY` | Yes (for live inference) | All Mistral API calls |
| `DATABASE_URL` | Yes | Postgres connection string (use Supabase Transaction pooler on port 6543 for serverless) |
| `SESSION_SECRET` | Yes in production | HMAC secret for session cookies |
| `VOXTRAL_VOICE_ID` | No | Mistral Studio voice for `/v1/audio/speech` |

Without `MISTRAL_API_KEY`, **Process project** can still load cached reference insights for the seeded `Q3 Launch` project.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed accounts and demo projects |
| `npm run db:studio` | Open Drizzle Studio |

## Seeded accounts

Accounts are provisioned by `npm run db:seed`. Passwords are bcrypt-hashed; each user can change theirs from the sidebar after login. Role is fixed to the account.

| Email | Role | Team | Projects |
|---|---|---|---|
| `manish@company.com` | Engineering | Backend | Q3 Launch |
| `shreyas@company.com` | Engineering | Platform | Q3 Launch, API Hardening |
| `nathan@company.com` | Marketing | Growth | Q3 Launch |
| `abdo@company.com` | Product | Product | Q3 Launch |
| `harin@company.com` | Executive | Leadership | Q3 Launch, API Hardening |

Chat history is private per `(project, user)`. Briefings and Alignment Radar filter to insights relevant to the signed-in role.

Try the deployed app at [https://syncspace-peach.vercel.app](https://syncspace-peach.vercel.app).

## Deployment

SyncSpace is live on Vercel at [https://syncspace-peach.vercel.app](https://syncspace-peach.vercel.app), backed by Supabase Postgres.

To redeploy or stand up a new environment:

1. Provision Postgres (Supabase Transaction pooler recommended for serverless).
2. Set `MISTRAL_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`, and optionally `VOXTRAL_VOICE_ID` in the host’s environment.
3. Run migrations and seed against that database:
   ```bash
   DATABASE_URL=<connection-string> npm run db:migrate
   DATABASE_URL=<connection-string> npm run db:seed
   ```
4. Deploy with Vercel (`npx vercel --prod`) or connect the repository in the Vercel dashboard.

## License

Built for the AIsoc Hackathon. See the repository for contribution and usage details.
