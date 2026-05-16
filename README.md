# TAIELTS — TA English Hub

A source-first English learning platform for Vietnamese learners.

Built around five product pillars:

- **Trusted Source Router** — every learning activity routes to a verified book / audio / web source with explicit license + trust metadata.
- **Module Builder** — content team / teachers compose lesson blocks with citations.
- **Today Plan** — students get a daily plan generated from assigned modules.
- **Citation-aware AI feedback** — Gemini-powered writing/speaking scoring that only cites approved sources.
- **Admin Console** — user/role management, audit log, source governance.

## Quick start

```bash
cd teaching-web
cp .env.example .env   # set NEXTAUTH_SECRET + GEMINI_API_KEY (optional for AI)
npm install
npm run db:push        # apply Prisma schema to SQLite
npm run db:seed        # seed demo users + sources + modules
npm run dev            # http://localhost:3001
```

### AI mock mode

Don't have a Gemini key, or hit the free-tier quota? Set `AI_MOCK=1` in `.env`.
The writing/speaking scorers will return deterministic `[MOCK]` rubric fixtures
while still exercising the full citation-context + server-side ID sanitization
path. Useful for UI/CI demos. Never enable this in production.

## Seed credentials

| Role | Email | Password | Lands on |
| --- | --- | --- | --- |
| Admin | `admin@taielts.local` | `admin123` | `/admin` |
| Teacher | `xuantai.net@gmail.com` | `teacher123` | `/teacher/dashboard` |
| Student | `huyentrang@taielts.local` | `huyentrang123` | `/student/dashboard` |

The seed installs three approved sources (Cambridge Dictionary, BBC 6 Minute English, Oxford 3000) and three published demo modules, with one of them already assigned to the student so `/student/today` has content out of the box.

## Project layout

```
teaching-web/        # Next.js 14 app (App Router)
  app/(admin)/       # Admin console (ADMIN-only)
  app/(builder)/     # Module builder (ADMIN + TEACHER)
  app/(teacher)/     # Teacher Studio
  app/(student)/     # Student app
  app/api/           # Route handlers (REST-ish)
  lib/               # contracts, ai-examiner, gamification, sources, modules, roles, audit
  prisma/            # schema + seed
  components/        # shared UI (sources, modules, ai, layout, ...)
  docs/mobile/       # mobile API contract + deep links + offline rules
  docs/beta/         # beta launch checklist
docs/ai-agent/       # AI-agent handoff docs (local-only — see .gitignore)
```

## Roadmap

The product is built phase-by-phase per [`docs/ai-agent/02_IMPLEMENTATION_ROADMAP.md`](docs/ai-agent/02_IMPLEMENTATION_ROADMAP.md). At the time of writing, Phases 2–8 are shipped and Phase 9 (polish + beta) is in progress.

## Useful scripts (run from `teaching-web/`)

```bash
npm run dev        # next dev --port 3001
npm run build      # production build + type-check
npm run db:push    # sync schema → SQLite
npm run db:gen     # regenerate Prisma client
npm run db:seed    # mega seed (idempotent)
npm run db:studio  # Prisma Studio
```

## License & copyright rules

The platform stores **metadata + outbound links** for third-party sources. Full copyrighted text/audio is never copied into the database. See `docs/beta/BETA_CHECKLIST.md` § 4 for the governance rules.
