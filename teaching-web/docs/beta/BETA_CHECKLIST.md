# Beta launch checklist — TA English Hub

Target: 30–50 học viên + 3–5 giáo viên + 1 admin trên một bản beta.

## 1. Smoke flows (end-to-end)

### 1.1 Source → Module → Today Plan loop

| Step | Expected |
| --- | --- |
| Login admin `admin@taielts.local` | Lands on `/admin` overview with 6 stat cards. |
| `/admin/sources` → create new source | Source appears in list with `DRAFT` badge. |
| Open source detail → add route → set Trust + License → click Approve | Audit log records `SOURCE_APPROVE`. |
| Login as teacher `xuantai.net@gmail.com` | Sidebar shows Builder + Sources (admin) only if ADMIN. |
| `/builder/modules/new` → create module | Status `DRAFT`. |
| Add `GRAMMAR_NOTE`, `READING`, `WRITING_PROMPT`, `SPEAKING_PROMPT` blocks | Each block attachable; citation picker shows the approved source. |
| Attach citation to writing block | Citation appears with verified badge. |
| Submit for review → admin publishes | Module shows `PUBLISHED v1`. |
| `/teacher/students/[id]` → Assign module | Assignment row appears with 0% progress. |
| Login as student `huyentrang@taielts.local` | `/student/today` shows the module's blocks. |
| Tick `GRAMMAR_NOTE` block | XP toast appears (`+30 XP`, streak update). |
| Open `WRITING_PROMPT` → write essay → Get AI feedback | Server validates citation context, AI returns rubric + verified citations; feedback saved. |
| Open `/student/feedback` | New feedback record visible with `PENDING_REVIEW`. |
| Teacher: `/teacher/feedback/[id]` → APPROVE + note | Audit log `AI_FEEDBACK_REVIEW`. |
| Student refreshes feedback detail | Status now `APPROVED`, teacher note visible. |

### 1.2 Role guards

| Try | Expected |
| --- | --- |
| Student GET `/admin/sources` | Redirect `/dashboard`. |
| Student GET `/builder/modules` | Redirect `/dashboard`. |
| Teacher GET `/admin` | Redirect `/dashboard`. |
| Anonymous GET any of the above | Redirect `/login`. |

### 1.3 Source governance

| Try | Expected |
| --- | --- |
| Admin blocks a source already cited by a published module | Block succeeds. Student detail page (and Today Plan) drops the citation silently. |
| Admin un-approves a source → student opens cached feedback detail | Server re-validates; the citation is omitted from the response. |
| Builder tries to attach a `DRAFT` / `BLOCKED` source | Picker only lists `APPROVED` sources. |

## 2. UI / UX

- [x] Loading skeleton on `/student/today` while plan fetches.
- [x] Empty states on `/admin/users`, `/admin/sources`, `/builder/modules`, `/student/feedback`.
- [x] Mobile drawer on `/admin/*` and `/builder/*` (hamburger top bar).
- [ ] Manual visual check on iPhone 13 (390×844) and iPad Mini (768×1024) once before launch.

## 3. Data quality

- [x] Seed runs idempotently (`npm run db:seed`).
- [x] Admin user `admin@taielts.local` exists with role `ADMIN`.
- [x] 3 approved sources (Cambridge / BBC / Oxford 3000) with 1 route each.
- [x] 3 published demo modules, one assigned to the seeded student.

## 4. Copyright / content rules

- [ ] No copyrighted full essays / book chapters / audio transcripts stored in DB.
- [ ] Every cited source has explicit `licenseStatus` (no `UNKNOWN` for approved).
- [x] AI prompts forbid invented citations; `citedCitationIds` are server-sanitized.
- [x] Blocked / deprecated sources never reach student-facing endpoints.

## 5. Operations

- [ ] `.env` set in deployment: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GEMINI_API_KEY`.
- [ ] `AI_MOCK` is **unset** in production (only used for local dev / CI).
- [ ] Migrate from SQLite → Postgres before public beta (see `prisma/schema.prisma`).
- [ ] Backup strategy: daily DB dump.
- [ ] Audit log retention policy (currently unlimited rows).
- [ ] Sentry / error tracking attached to `npm run start`.

## 6. Analytics

- [x] Event constants defined in `lib/analytics.ts`.
- [ ] Tracker provider wired up (PostHog/Mixpanel/GA4) — pick before launch.
- [ ] Verify `BLOCK_COMPLETED`, `AI_SCORE_REQUESTED`, `MODULE_ASSIGNED` fire.

## 7. Mobile-readiness contract

- [x] `/api/version` reachable without auth.
- [x] `lib/contracts/*` published with `API_VERSION = 1`.
- [x] `docs/mobile/` contains: mobile_api_contract, deep_linking_rules, offline_sync_rules.

## 8. Known limitations to communicate to beta users

1. Block types live in v1: `GRAMMAR_NOTE`, `READING`, `WRITING_PROMPT`, `SPEAKING_PROMPT`. Audio/video/quiz blocks are not yet supported.
2. AI scoring is text-based only (no audio upload). Speaking is graded from a transcript.
3. Course Track (grouping multiple modules into a curriculum) is not in v1 — assign modules individually.
4. No native mobile app yet; the web is responsive.
5. No `/admin/settings` page yet — system settings are environment variables.

## 9. Rollback plan

- DB: keep the latest pre-launch `dev.db` (or Postgres dump) tagged as `pre-beta-YYYY-MM-DD`.
- Git: tag the release commit (`git tag beta-0.1`) so revert is one command.
- If AI provider misbehaves, set `GEMINI_API_KEY=""` — `/api/ai/score-*` returns 503 without crashing.
