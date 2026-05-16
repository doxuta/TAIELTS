import type { ModuleStatus, ModuleSkill, BlockType } from '@/lib/modules'

export interface ModuleSummary {
  id: string
  slug: string
  title: string
  summary: string | null
  skill: ModuleSkill | null
  cefrLevel: string | null
  targetBand: number | null
  week: number | null
  estimatedMinutes: number | null
  status: ModuleStatus
  version: number
  publishedAt: string | null
  updatedAt: string
}

export interface BlockSummary {
  id: string
  moduleId: string
  type: BlockType
  title: string
  order: number
  estimatedMinutes: number | null
  /**
   * Free-form JSON for block content. The schema depends on `type`:
   *   GRAMMAR_NOTE / READING → { body: string }
   *   WRITING_PROMPT → { body: string, writingTaskType: 'TASK_1' | 'TASK_2' }
   *   SPEAKING_PROMPT → { body: string, speakingPart: 1 | 2 | 3 }
   */
  contentJson: string | null
}
