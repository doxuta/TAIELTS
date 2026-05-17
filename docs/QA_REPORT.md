# QA Report — shadcn migration

**Date:** 2026-05-17
**Tester:** Claude (acting as QA tester)
**Scope:** Full migration pass after A.2.5 (builder) + A.2.6 (teacher) + A.2.7 (student) + admin A/B/C/D expansion.

## Setup

```
cd teaching-web
npm run dev   # port 3001
```

Seeded accounts used:
- admin: `admin@taielts.local` / `admin123`
- teacher: `xuantai.net@gmail.com` / `teacher123`
- student: `huyentrang@taielts.local` / `huyentrang123`

## Coverage

42 routes touched across the three roles:

| Role | Count | Routes |
|------|-------|--------|
| admin/builder | 12 | `/admin`, `/admin/users`, `/admin/sources`, `/admin/sources/new`, `/admin/audit`, `/admin/modules`, `/admin/settings`, `/admin/inbox`, `/builder/modules`, `/builder/modules/new`, `/builder/modules/[id]`, `/builder/modules/[id]/preview` |
| teacher | 18 | `/teacher/dashboard`, `/teacher/students`, `/teacher/students/new`, `/teacher/students/[id]`, `/teacher/roadmap`, `/teacher/lessons`, `/teacher/lessons/new`, `/teacher/assignments`, `/teacher/mock-tests`, `/teacher/strategies`, `/teacher/sample-essays`, `/teacher/speaking-cues`, `/teacher/errors`, `/teacher/rubrics`, `/teacher/progress`, `/teacher/reports`, `/teacher/feedback`, `/teacher/sessions/new` |
| student | 12 | `/student/dashboard`, `/student/today`, `/student/lessons`, `/student/assignments`, `/student/vocab`, `/student/feedback`, `/student/errors`, `/student/journal`, `/student/strategies`, `/student/sample-essays`, `/student/mock-tests`, `/student/speaking` |

## Functional check

| Check | Result |
|------|--------|
| `npm run build` | ✓ Compiled successfully, 70 static pages |
| HTTP 200 on all 42 logged-in routes | ✓ 42/42 |
| No `Application error` / `TypeError` / `ReferenceError` in rendered HTML | ✓ |
| Cross-role guards (teacher→/admin, student→/admin, student→/teacher) | ✓ All return 307 redirect |
| No-auth → protected routes | ✓ 307 redirect |
| Dev log: SSR errors after fresh `.next` cache | ✓ Clean (jose vendor-chunk warning was a stale `.next` artifact from running build during dev; gone after rebuild) |

## Visual consistency check

Spot-checked rendered HTML for the presence of new shadcn tokens vs old legacy tokens.

| Surface | shadcn tokens present | legacy leak |
|--------|----------------------|-------------|
| `/teacher/dashboard` page body | ✓ `text-muted-foreground`, `bg-card`, `border` | layout uses `bg-surface-secondary` |
| `/student/today` page body | ✓ glassmorphism gradient + `bg-card/60` `backdrop-blur-xl` | sidebar avatar still uses `from-brand-500 to-violet-600` |
| `/admin` page body | ✓ KPI cards, recharts, audit log | clean (AdminShell uses AppShell which is shadcn) |
| `/builder/modules/[id]` page body | ✓ all migrated | clean |

## Findings

### ISSUE-1 — TeacherShell layout uses legacy `bg-surface-secondary` (MINOR, visual)
**File:** `components/layout/TeacherShell.tsx`
**What:** The outer wrapper is `<div className="flex h-screen bg-surface-secondary overflow-hidden">` and the mobile top bar uses `bg-surface border-b border-surface-border` + `btn-icon` + `text-ink`.
**Impact:** Cosmetic — coexisting tokens still resolve to a valid color, but the page body now uses shadcn (`bg-card`, `text-muted-foreground`) and the wrapper uses the legacy palette. On dark-mode toggle these will drift. Mobile menu button uses `btn-icon` (legacy).
**Recommended fix:** Replace with `bg-background` / `border-border` / `<Button variant="ghost" size="icon">`. Drop `bg-surface-secondary` wrapper entirely — let main inherit.

### ISSUE-2 — Student layout uses legacy `bg-surface-secondary`, `bg-sidebar`, and inline `sidebar-link` (MINOR, visual + dead-code)
**File:** `app/(student)/layout.tsx`
**What:**
- Outer: `<div className="flex h-screen bg-surface-secondary overflow-hidden">`
- Sidebar: hand-rolled `<aside className="w-[220px] ... bg-sidebar border-r border-sidebar-border">`
- Nav links: `<a className="sidebar-link">{item.label}</a>` — relies on the legacy `.sidebar-link` component class
- Sidebar avatar gradient uses `from-brand-500 to-violet-600` instead of `from-primary`
**Impact:** Sidebar pattern diverges from `AdminShell` / `BuilderShell` / `TeacherShell` (which use `AppShell`). Sidebar is plain `<a>` so client-side routing is full reload, not Next `<Link>`. No active-state highlighting.
**Recommended fix:** Wrap the student layout in `AppShell` (or a new `StudentShell` that mirrors `AdminShell`). At minimum: swap `<a>` to Next `<Link>` and use the same `sidebar-link / .active` markup that admin/builder use, plus `from-primary` for the avatar.

### ISSUE-3 — TeacherSidebar still uses `bg-sidebar` + `from-brand-500` (MINOR, visual)
**File:** `components/layout/TeacherSidebar.tsx`
**What:** Hand-rolled sidebar with `text-sidebar-foreground/60` classes and a `from-brand-500 to-violet-600` logo gradient. Pre-dates AppShell.
**Impact:** Functionally fine and uses shadcn `--sidebar-*` CSS vars, but it's parallel to `AdminShell`/`BuilderShell` which use `AppShell`. Means three sidebars to keep in sync instead of one.
**Recommended fix:** Migrate `TeacherShell` + `TeacherSidebar` to `AppShell` like `AdminShell`. Out of scope for this QA pass but tagged for future cleanup.

### ISSUE-4 — Native `<select>` styled inconsistently in a few places (TRIVIAL)
**Where:** `app/(builder)/builder/modules/new/NewModuleForm.tsx`, `app/(builder)/builder/modules/[id]/BlockManager.tsx`, `app/(teacher)/teacher/lessons/new/page.tsx` (no select), `app/(teacher)/teacher/students/new/page.tsx`, `app/(teacher)/teacher/students/[id]/AssignModuleAction.tsx`.
**What:** Where we intentionally kept native `<select>` (form ergonomics inside controlled forms), we apply an inline class string `flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`. Repeated across files.
**Impact:** Maintenance — if shadcn input styling changes, we update all of these by hand.
**Recommended fix:** Promote to a `NATIVE_SELECT_CLASS` constant in `lib/utils.ts` or wrap as a tiny `NativeSelect` component. Low priority.

### ISSUE-5 — `/student/feedback` empty Select inside `sessions/new` (MINOR, runtime warning)
**File:** `app/(teacher)/teacher/sessions/new/page.tsx`
**What:** The lesson-link `<SelectItem value="">Không liên kết</SelectItem>` uses an empty-string value, which Radix Select treats as a special reset value and will warn about. Functionally still works.
**Impact:** React console warning if anyone has the page open with devtools.
**Recommended fix:** Use a sentinel like `<SelectItem value="none">Không liên kết</SelectItem>` and translate `"none"` → `""` before submit.

### ISSUE-6 — `MockTestResultPage` `searchParams` access (TRIVIAL)
**File:** `app/(student)/student/mock-tests/[id]/result/page.tsx`
**What:** Reading `searchParams.get('attemptId')` in a client component without a `<Suspense>` boundary. Next 14 build emits a `useSearchParams() should be wrapped in a suspense boundary` static-bailout warning during build; we already bailed out via parent `force-dynamic` on the take page but the result page does not declare it.
**Impact:** Build passes; no runtime crash. Slight perf hit on first paint.
**Recommended fix:** Add `<Suspense>` around the result body, or pull `attemptId` via the URL path instead of querystring (cleanest).

### NO-ISSUE — `.next` `jose` MODULE_NOT_FOUND
Observed once during dev iteration. Root cause: ran `npm run build` while `next dev` was running, which clobbered the dev's chunk manifest. Resolution: `rm -rf .next && npm run dev`. Not a code bug. Documented here so the next person who sees it knows it's not new.

## Severity summary

| Severity | Count |
|---------|------|
| CRITICAL | 0 |
| MAJOR | 0 |
| MINOR | 3 (ISSUE-1, ISSUE-2, ISSUE-5) |
| TRIVIAL | 3 (ISSUE-3, ISSUE-4, ISSUE-6) |

## Recommendation

Ship the migration. Pick up the layout cleanup (ISSUE-1, ISSUE-2, ISSUE-3) in a follow-up commit so the student/teacher shells use the same `AppShell` foundation as admin/builder. ISSUE-5 should be fixed in the same pass because it's a developer-visible warning. ISSUE-4 and ISSUE-6 are cleanup-when-touched.

## Next steps (handed off to senior-dev pass)

1. Fix ISSUE-5 (sessions/new empty SelectItem) — 5 minute fix.
2. Fix ISSUE-2 (student layout) — wrap in `AppShell`-like, swap `<a>` → `<Link>`, use `from-primary`.
3. Fix ISSUE-1 (TeacherShell wrapper) — `bg-background` + drop legacy classes.
4. Leave ISSUE-3, ISSUE-4, ISSUE-6 documented; not blocking.

---

## Senior-dev pass (same session)

| Issue | Status | Resolution |
|------|--------|-----------|
| ISSUE-1 TeacherShell legacy wrapper | ✓ FIXED | `bg-surface-secondary` → `bg-background`; mobile menu now uses `<Button variant="ghost" size="icon">` + `bg-background/95 backdrop-blur border-b`; brand gradient uses `from-primary to-violet-600`. |
| ISSUE-2 Student layout | ✓ FIXED | New `components/layout/StudentShell.tsx` built on `AppShell` (same foundation as Admin/Builder). Three nav sections: Trang chính / Luyện kỹ năng / Lớp học. Layout file shrunk from 55 lines of inline markup to a 22-line shell wrapper. Active-state highlight + Next `<Link>` routing + collapsible sidebar all now work for students. |
| ISSUE-5 Radix empty SelectItem | ✓ FIXED | `sessions/new` lesson-link select uses `value="none"` sentinel; translates back to `""` in `onValueChange`. |
| ISSUE-3 TeacherSidebar parallel to AppShell | DEFERRED | Tagged in QA report as future cleanup. Not blocking. |
| ISSUE-4 Native `<select>` class duplication | DEFERRED | Tagged. Small enough to clean up when next touched. |
| ISSUE-6 result-page `useSearchParams` w/o Suspense | DEFERRED | No build failure or runtime crash; tracked for follow-up. |

Verified after fixes:
- `npm run build` → clean
- 12/12 student routes return 200 with new `StudentShell`
- 4/4 teacher routes spot-checked return 200 after `TeacherShell` rewrite
- Student dashboard HTML no longer contains `bg-surface-secondary` or `sidebar-link` class leaks (0 occurrences vs 2 before fix)
- Cross-role guards still hold (still 307)
