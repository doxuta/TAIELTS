# Deep linking rules — V1

Stable web URLs that a future mobile app should map to native screens. Web
routes are the source-of-truth identifiers; mobile rewrites them locally.

## URL → mobile screen

| Web path | Mobile route name | Params | Notes |
| --- | --- | --- | --- |
| `/student/today` | `Today` | — | Default landing for students. |
| `/student/feedback` | `FeedbackInbox` | — | Student's own AI feedback list. |
| `/student/feedback/:id` | `FeedbackDetail` | `id` | One AI feedback record. |
| `/student/vocab` | `Vocab` | — | SRS review (out of scope for V1 mobile). |
| `/student/mock-tests` | `MockTests` | — | Optional in V1. |
| `/student/mock-tests/:id/take` | `MockTestRun` | `id` | Optional in V1. |
| `/student/lessons` | `Lessons` | — | Out of scope V1. |
| `/teacher/feedback/:id` | `TeacherFeedbackReview` | `id` | Only for staff users. |
| `/admin/sources/:id` | `AdminSourceDetail` | `id` | Only for admin users. |

The mobile app should treat URLs with unknown shapes as **web fallback** —
open in an in-app browser rather than crash.

## Universal links / custom scheme

Two acceptable strategies:

1. **Universal link**: `https://app.taenglishhub.example/...` mirrors web path
   verbatim; Expo `Linking` reads the path and dispatches to the mobile route.
2. **Custom scheme**: `taielts://today`, `taielts://feedback/abc123`, etc.
   Maintain a static table in the mobile app mirroring this doc.

Prefer **(1)** so emails / push messages / web shares "just work" across web
and mobile.

## Push notification payload shape

```json
{
  "title": "Hôm nay có 3 việc",
  "body": "Hoàn thành để giữ streak 🔥",
  "data": {
    "type": "TODAY_REMINDER",
    "deepLink": "https://app.taenglishhub.example/student/today"
  }
}
```

`data.deepLink` should always be a fully-qualified URL so the mobile router
can branch without parsing free-form types.

## Stable identifiers

- `Source.id`, `SourceRoute.id`, `Citation.id`, `LearningModule.id`,
  `LessonBlock.id`, `ModuleAssignment.id`, `AIFeedback.id` are all CUIDs
  (`c...`) and are stable for the lifetime of the row.
- `LearningModule.slug` is stable per row but is auto-disambiguated on
  conflict (`-2`, `-3`...) so do **not** use the slug as a sync key.
- `User.id` is stable. `User.email` may change.

## Rules

- Mobile must accept new path segments under known prefixes (`/student/...`,
  `/teacher/...`, `/admin/...`) without crashing.
- If the server returns a 410 Gone for a deep link target, mobile should
  navigate to the nearest list view (`Today`, `FeedbackInbox`, etc.) instead
  of showing an error toast.
