import type { BlockType } from '@/lib/modules'
import type { CitationSummary } from './source'

export interface TodayItem {
  blockId: string
  blockType: BlockType
  blockTitle: string
  /** Order within its source module — useful for stable rendering. */
  order: number
  estimatedMinutes: number | null
  moduleId: string
  moduleTitle: string
  assignmentId: string
  /** `null` if the learner has never opened this block. */
  progressId: string | null
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  /** Raw block content (see BlockSummary for shape). */
  contentJson: string | null
}

export interface TodayResponse {
  items: TodayItem[]
  /**
   * Citations for the blocks in `items`. Mobile clients can group by
   * `attachedToId === item.blockId`.
   */
  citations: CitationSummary[]
}

export interface BlockProgressPatchRequest {
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  minutesSpent?: number
}

export interface BlockProgressPatchResponse {
  progress: {
    id: string
    assignmentId: string
    blockId: string
    status: string
    completedAt: string | null
    minutesSpent: number | null
  }
  xp: XPAward | null
}

export interface XPAward {
  xpAwarded: number
  bonusXP: number
  levelUp: boolean
  streakChanged: boolean
  freezeUsed: boolean
  goalJustMet: boolean
  streak: {
    currentStreak: number
    longestStreak: number
    totalXP: number
    level: number
  }
}
