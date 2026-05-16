# Offline sync rules — V1

The web is online-only. These rules define what a future mobile client may
safely do while offline and how to reconcile on reconnect.

## Read-only data (safe to cache)

| Resource | Cache key | TTL guidance |
| --- | --- | --- |
| Today plan (`GET /api/today`) | `today:{userId}:{yyyy-mm-dd}` | 1 hour or until user pulls-to-refresh |
| Module detail (`GET /api/modules/:id`) | `module:{id}:{version}` | Until `module.version` bumps |
| Source / Source route metadata | `source:{id}` | 24 hours |
| Citation list per block | `citations:LESSON_BLOCK:{blockId}` | 24 hours |
| Student's own AI feedback list | `feedback:{userId}` | 5 minutes |
| AI feedback detail | `feedback:{id}` | Re-fetch on view (server re-validates citations) |

Mobile must invalidate caches on:

- A successful write that affects the cache (e.g. `PATCH today/items/...`
  invalidates `today:*`).
- An `apiVersion` mismatch from `/api/version`.

## Idempotent writes (retry-safe)

These can be queued offline and replayed on reconnect:

| Endpoint | Idempotency key |
| --- | --- |
| `PATCH /api/today/items/:blockId` | `(userId, blockId, status, dateKey)` — server upserts. |

Server already protects against double-XP: XP is only awarded on the **first
transition** into `COMPLETED`. Replays return the same `progress` row but
`xp` may be `null` on subsequent replays — treat both as success.

## Non-idempotent writes (must be online)

These should **not** be replayed silently if a network error happens
mid-flight; surface to the user instead:

| Endpoint | Reason |
| --- | --- |
| `POST /api/ai/score-writing` | Costs an LLM call — replay would double-charge. |
| `POST /api/ai/score-speaking` | Same. |
| `POST /api/students/:id/assign-module` | Has a uniqueness constraint; 409 on retry is acceptable but confuses UX. |
| `POST /api/modules/:id/publish` | Bumps version; ADMIN only. |

For the AI endpoints, mobile should:

1. Persist the user's draft locally with a `pendingScore=true` flag.
2. Only POST when online + on explicit user gesture (tap "Score now").
3. Show a transient error if the server returns 503 (upstream AI down) and
   keep the draft.

## Conflict resolution

V1 is single-actor per resource:

- Only the student writes to their own `ModuleBlockProgress`. No conflicts.
- Only ADMIN writes to `Source` review status; the mobile app never writes.

If a future surface adds shared writes (e.g. multiple teachers reviewing the
same feedback), introduce `If-Match: <etag>` headers and add a 412 path.

## Clock skew

All timestamps are server-issued UTC. Mobile should never trust device time
for streak / due-date calculations; always read `streak.lastActivityDate`
and other timestamps from the server.

## Local-only state

These are fine to keep purely on device, never synced:

- Draft essay / speaking transcripts before scoring.
- UI preferences (dark mode, language).
- Read receipts for feedback notifications.

## Sync strategy summary

1. On app start: `GET /api/version`. If `apiVersion` higher than what the app
   knows, prompt to upgrade.
2. On Today screen open: `GET /api/today`; merge into local store.
3. On block tap → load cached module/citations if present, otherwise fetch.
4. On block toggle → optimistic UI; queue `PATCH` if offline; replay on
   reconnect (idempotent).
5. On AI-score submit → require online; show inline error otherwise.
6. On reconnect → drain idempotent queue; surface non-idempotent drafts to
   the user.
