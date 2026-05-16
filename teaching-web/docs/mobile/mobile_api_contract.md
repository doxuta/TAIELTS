# Mobile API contract — V1

This document is the authoritative shape of the TA English Hub HTTP API that a
future mobile app (Expo React Native) is expected to consume.

> Source-of-truth TS types live in `teaching-web/lib/contracts/`. Import them
> from a shared package when the monorepo is split.

## Versioning

- `API_VERSION = 1` (see `lib/contracts/index.ts`).
- Probe `GET /api/version` (no auth) returns `{ apiVersion, buildTime, minSupportedClient }`.
- Breaking changes (renaming/removing fields, changing types) require bumping
  `API_VERSION`. Adding optional fields is non-breaking.

## Authentication

NextAuth credentials with JWT cookies (`next-auth.session-token`). Mobile must
implement the same `/api/auth/callback/credentials` POST flow with
`csrfToken` from `/api/auth/csrf` or use a future bearer-token endpoint.

For mobile V1 prep, plan to add `POST /api/mobile/login` that issues a
long-lived token (out of scope for this slice).

## Endpoints used by mobile (V1)

### Today plan

- `GET /api/today` → `TodayResponse`
- `PATCH /api/today/items/:blockId` → `BlockProgressPatchResponse`
  - Body: `BlockProgressPatchRequest`
  - **Idempotent.** Calling with the same `status` twice does not double-award XP
    (XP is only granted on the first transition into `COMPLETED`).

### Sources & citations

- `GET /api/sources?reviewStatus=APPROVED` → `SourceSummary[]` (with `routes`)
  - Students never see DRAFT / PENDING_REVIEW / DEPRECATED / BLOCKED sources.
- `GET /api/sources/:id` → `SourceSummary & { routes }`
- `GET /api/citations?attachedToType=X&attachedToId=Y` → `CitationSummary[]`
- (`POST/PATCH/DELETE` admin-only — out of scope for mobile V1)

### Modules

- `GET /api/modules?status=PUBLISHED` → `Array<ModuleSummary & { blockCount }>`
- `GET /api/modules/:id` → `ModuleSummary & { blocks: BlockSummary[] }`
- (Builder writes are out of scope for mobile V1.)

### AI feedback

- `POST /api/ai/score-writing`
  - Body: `ScoreWritingRequest`
  - Pass `blockId` to auto-pull approved citations into the prompt.
- `POST /api/ai/score-speaking`
  - Body: `ScoreSpeakingRequest`
- `GET /api/ai-feedback?teacherStatus=…&userId=…`
  - Students: only their own. Staff: optional `userId` filter.
- `GET /api/ai-feedback/:id` → `AIFeedbackDetail`
  - Citations are **re-validated** on each GET; if a source has been blocked
    since scoring, its citation is omitted.

## Universal response shape rules

- All IDs are stable CUIDs.
- All timestamps are ISO 8601 strings (UTC).
- All booleans are real booleans, not `0/1`.
- JSON-as-string fields (e.g. `contentJson`, `outputJson`) are explicitly
  named with the `Json` suffix and require client-side `JSON.parse`.
- Arrays never paginate implicitly. If you need pagination later, add an
  envelope `{ data, nextCursor }` — do not silently change array endpoints.

## Error shape

```json
{ "error": "human-readable string" }
```

Plus HTTP status:

| Code | Meaning |
| --- | --- |
| 400 | Validation error |
| 401 | Missing/invalid auth |
| 403 | Authenticated but not allowed |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate module assignment) |
| 422 | Business-rule violation (e.g. empty module published) |
| 503 | Upstream AI provider failure |

## Things mobile **must not** assume

- Don't assume web URL shape (`/student/...`). Use the deep link map in
  `deep_linking_rules.md`.
- Don't assume the server filters BLOCKED/DEPRECATED content for staff
  endpoints — only student-scoped endpoints filter implicitly.
- Don't read fields prefixed with `_` (Prisma internals); look for explicit
  fields like `blockCount` instead.
