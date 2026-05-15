/**
 * FSRS-6 (Free Spaced Repetition Scheduler) wrapper for vocab cards.
 * Falls back to SM-2 when card has no FSRS state yet.
 *
 * FSRS outperforms SM-2 by ~20-30% in retention efficiency
 * (https://github.com/open-spaced-repetition).
 */
import { FSRS, Rating, State, createEmptyCard, generatorParameters, type Card, type Grade } from 'ts-fsrs'

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

const RATING_MAP: Record<ReviewRating, Grade> = {
  again: Rating.Again as Grade,
  hard: Rating.Hard as Grade,
  good: Rating.Good as Grade,
  easy: Rating.Easy as Grade,
}

const STATE_MAP: Record<State, string> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
}

const REVERSE_STATE_MAP: Record<string, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
}

const params = generatorParameters({
  enable_fuzz: true,
  request_retention: 0.9, // target 90% recall — top-tier default
})
const fsrs = new FSRS(params)

interface VocabCardSRSState {
  stability?: number | null
  difficulty?: number | null
  state?: string | null
  dueDate: Date
  lastReviewedAt?: Date | null
  repetitions: number
}

export interface SRSUpdate {
  stability: number
  difficulty: number
  state: string
  dueDate: Date
  lastReviewedAt: Date
  repetitions: number
  // Legacy SM-2 fields kept in sync for backward compat:
  interval: number
  easeFactor: number
}

/**
 * Compute next review state given current card state + rating.
 * Returns fields ready to be persisted to VocabCard.
 */
export function scheduleReview(card: VocabCardSRSState, rating: ReviewRating): SRSUpdate {
  const now = new Date()

  // Hydrate FSRS card from DB state (or create empty if first review)
  let fsrsCard: Card
  if (card.stability != null && card.difficulty != null && card.state != null) {
    fsrsCard = {
      due: card.dueDate,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.lastReviewedAt
        ? Math.max(0, (now.getTime() - card.lastReviewedAt.getTime()) / 86_400_000)
        : 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: card.repetitions,
      lapses: 0,
      state: REVERSE_STATE_MAP[card.state] ?? State.New,
      last_review: card.lastReviewedAt ?? undefined,
    }
  } else {
    fsrsCard = createEmptyCard(now)
  }

  const result = fsrs.next(fsrsCard, now, RATING_MAP[rating])
  const next = result.card

  // Mirror to SM-2 fields so UI showing "interval/easeFactor" still works
  const intervalDays = Math.max(1, Math.round((next.due.getTime() - now.getTime()) / 86_400_000))
  const easeFactor = Math.max(1.3, 2.5 + (next.difficulty < 5 ? 0.2 : -0.1))

  return {
    stability: next.stability,
    difficulty: next.difficulty,
    state: STATE_MAP[next.state],
    dueDate: next.due,
    lastReviewedAt: now,
    repetitions: next.reps,
    interval: intervalDays,
    easeFactor,
  }
}

/**
 * Get cards due now or within given hours.
 * Used by /student/vocab and /student/today.
 */
export function isDue(card: { dueDate: Date }, withinHours = 0): boolean {
  const cutoff = new Date(Date.now() + withinHours * 3_600_000)
  return card.dueDate <= cutoff
}

/**
 * Map 0-3 rating from UI (legacy) to FSRS rating string.
 * 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
 */
export function legacyRatingToFsrs(n: number): ReviewRating {
  if (n <= 0) return 'again'
  if (n === 1) return 'hard'
  if (n === 2) return 'good'
  return 'easy'
}
