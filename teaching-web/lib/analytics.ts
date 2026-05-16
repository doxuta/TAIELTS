/**
 * Analytics event constants.
 *
 * No tracker is wired up yet — these are the canonical event names that any
 * future integration (PostHog, Mixpanel, GA4, custom) must use. Server- and
 * client-side code can import these to avoid drift.
 *
 * Naming convention: `<DOMAIN>_<VERB>_<NOUN?>`, SNAKE_CASE.
 * Verb tense:
 *   - `*_VIEW`        — surface rendered
 *   - `*_COMPLETED`   — user finished an action with a measurable outcome
 *   - `*_REQUESTED`   — user triggered something that takes time / costs money
 *   - `*_APPROVED`    — staff resolution
 */

export const EVENTS = {
  // Onboarding & navigation
  LOGIN_SUBMITTED: 'login_submitted',
  LOGIN_SUCCEEDED: 'login_succeeded',
  LOGIN_FAILED: 'login_failed',
  TODAY_VIEW: 'today_view',
  DASHBOARD_VIEW: 'dashboard_view',

  // Today plan
  BLOCK_VIEWED: 'block_viewed',
  BLOCK_COMPLETED: 'block_completed',
  BLOCK_REOPENED: 'block_reopened',
  STREAK_INCREMENTED: 'streak_incremented',
  STREAK_BROKEN: 'streak_broken',
  STREAK_FREEZE_USED: 'streak_freeze_used',
  LEVEL_UP: 'level_up',
  DAILY_GOAL_MET: 'daily_goal_met',

  // Vocabulary
  VOCAB_REVIEW_COMPLETED: 'vocab_review_completed',

  // AI feedback
  AI_SCORE_REQUESTED: 'ai_score_requested',
  AI_SCORE_SUCCEEDED: 'ai_score_succeeded',
  AI_SCORE_FAILED: 'ai_score_failed',
  AI_FEEDBACK_OPENED: 'ai_feedback_opened',
  AI_FEEDBACK_REVIEWED: 'ai_feedback_reviewed',

  // Sources (admin / builder)
  SOURCE_CREATED: 'source_created',
  SOURCE_APPROVED: 'source_approved',
  SOURCE_DEPRECATED: 'source_deprecated',
  SOURCE_BLOCKED: 'source_blocked',

  // Modules (builder)
  MODULE_CREATED: 'module_created',
  MODULE_SUBMITTED_FOR_REVIEW: 'module_submitted_for_review',
  MODULE_PUBLISHED: 'module_published',
  MODULE_ARCHIVED: 'module_archived',
  BLOCK_CREATED: 'block_created',
  CITATION_ATTACHED: 'citation_attached',

  // Assignment lifecycle
  MODULE_ASSIGNED: 'module_assigned',
  MODULE_ASSIGNMENT_COMPLETED: 'module_assignment_completed',

  // Admin
  USER_ROLE_CHANGED: 'user_role_changed',
} as const

export type AnalyticsEvent = (typeof EVENTS)[keyof typeof EVENTS]

/**
 * Standard property names. Use these as keys in the props object passed to
 * the tracker so downstream queries are consistent.
 */
export const PROPS = {
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
  MODULE_ID: 'module_id',
  MODULE_SLUG: 'module_slug',
  BLOCK_ID: 'block_id',
  BLOCK_TYPE: 'block_type',
  SOURCE_ID: 'source_id',
  SOURCE_TYPE: 'source_type',
  ASSIGNMENT_ID: 'assignment_id',
  AI_FEEDBACK_ID: 'ai_feedback_id',
  AI_KIND: 'ai_kind',
  BAND: 'band',
  XP_AWARDED: 'xp_awarded',
  STREAK: 'streak',
  LEVEL: 'level',
} as const

export type AnalyticsProps = Partial<Record<(typeof PROPS)[keyof typeof PROPS], string | number | boolean>>

/**
 * Stub tracker. Replace with a real provider call when one is wired up.
 * Keeps callsites future-proof.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, props ?? {})
  }
}
