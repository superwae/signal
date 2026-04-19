# Signal — content automation

Turn meeting signals into LinkedIn posts that sound like you.

What it does:
- Reads a meeting transcript and extracts "signals" — specific moments worth posting about
- Drafts a LinkedIn post for the right author using the right framework
- Scores each draft on hook strength and specificity
- Learns each author's voice from edits — next draft sounds more like them
- Hands approved posts to a designer via a Claude-generated design brief + SVG mock
- Feeds post analytics back into generation so top-performing hooks get reused

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # fill in ANTHROPIC_API_KEY, DATABASE_URL, AUTH_SECRET, ALLOWED_EMAILS
npm run db:push              # create tables on Neon
npx tsx scripts/seed.ts      # seed default frameworks + an author
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Create a Postgres database on [Neon](https://neon.tech). Copy the pooled connection string.
2. Push this repo to GitHub, then "Import Project" on Vercel.
3. In Vercel project settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL` — the Neon pooled URL
   - `AUTH_SECRET` — any strong random string (`openssl rand -base64 32`)
   - `ALLOWED_EMAILS` — `waelsalameh255@gmail.com,dana@yourdomain.com`
   - `FATHOM_WEBHOOK_SECRET` — optional, any string
4. Deploy. On first deploy, Vercel runs the build. After it's up, run `npm run db:push` locally against the production `DATABASE_URL`, or use `drizzle-kit push` from a one-off Vercel job.
5. Seed: `DATABASE_URL=... npx tsx scripts/seed.ts`.

## Fathom integration

Point a Fathom webhook at `https://yourdomain.com/api/fathom/webhook` with header `x-webhook-secret: <FATHOM_WEBHOOK_SECRET>`. The endpoint accepts any of these payload shapes:

- `{ transcript, title?, started_at? }`
- `{ transcript_text, ... }`
- `{ meeting: { transcript, ... } }`

If you don't want to wire Fathom yet, just paste transcripts at `/signals/new`.

## Architecture

- **Next.js 14** (App Router) + **Server Actions** — no separate API layer for internal calls
- **Drizzle ORM** on **Neon Postgres** (serverless)
- **Anthropic SDK** for generation, scoring, voice learning, and design briefs
- **Tailwind** + custom shadcn-style UI primitives
- **Middleware** for a simple shared-password login (allowlist by email)

Code map:
- `app/` — pages + API routes
- `lib/db/schema.ts` — database tables
- `lib/actions.ts` — server actions (the brain)
- `lib/claude.ts` — every prompt lives here
- `components/` — UI
- `scripts/seed.ts` — starter frameworks + authors

## What's different vs. Lina's system

- **Auto-learn from edits**: every manual or assisted edit is stored; after a couple edits, Claude updates the author's voice profile and includes it in future prompts. Lina's didn't do this.
- **Top-hook reuse**: the analytics loop feeds the top-performing hooks (by likes) back into generation for that author.
- **Single source of truth**: one app for capture → draft → review → design → publish → analytics. No ClickUp round-trip for the design brief.
