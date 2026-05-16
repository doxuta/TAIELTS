import type { CitationSummary } from './source'

export type AIFeedbackKind =
  | 'WRITING_TASK1'
  | 'WRITING_TASK2'
  | 'SPEAKING_PART1'
  | 'SPEAKING_PART2'
  | 'SPEAKING_PART3'

export type TeacherReviewStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'NEEDS_REWORK'
  | 'OVERRIDDEN'

export interface Criterion {
  band: number
  justification: string
}

export interface AIFeedbackOutput {
  taskResponse?: Criterion
  coherence?: Criterion
  fluency?: Criterion
  lexical?: Criterion
  grammar?: Criterion
  pronunciation?: Criterion
  overallBand: number
  summaryFeedback: string
  improvementSuggestions: string[]
  /** Sanitized server-side: only IDs known to the approved context. */
  citedCitationIds: string[]
}

export interface AIFeedbackSummary {
  id: string
  kind: AIFeedbackKind
  model: string
  overallBand: number | null
  summaryFeedback: string | null
  attachedToType: string | null
  attachedToId: string | null
  teacherStatus: TeacherReviewStatus
  teacherNotes: string | null
  createdAt: string
  reviewedAt: string | null
}

export interface AIFeedbackDetail extends AIFeedbackSummary {
  /** Full input passed to the model (essay/transcript + options). */
  inputJson: string
  /** Full model output as JSON string (parse for AIFeedbackOutput). */
  outputJson: string
  /** Citations re-validated server-side on every GET. */
  citations: CitationSummary[]
}

/** Request body for POST /api/ai/score-writing */
export interface ScoreWritingRequest {
  prompt: string
  essay: string
  taskType: 'TASK_1' | 'TASK_2'
  /** Optional anchor for the feedback. */
  blockId?: string | null
  /** Explicit citation IDs (in addition to those auto-pulled via blockId). */
  citationIds?: string[]
  attachedToType?: string | null
  attachedToId?: string | null
}

/** Request body for POST /api/ai/score-speaking */
export interface ScoreSpeakingRequest {
  part: 1 | 2 | 3
  transcript: string
  blockId?: string | null
  citationIds?: string[]
  attachedToType?: string | null
  attachedToId?: string | null
}

/** Response merges score output + the persisted feedback id. */
export interface ScoreResponse extends AIFeedbackOutput {
  aiFeedbackId: string
}
