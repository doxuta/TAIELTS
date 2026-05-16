export const MODULE_STATUSES = ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'] as const
export type ModuleStatus = (typeof MODULE_STATUSES)[number]

export const MODULE_SKILLS = [
  'LISTENING',
  'READING',
  'WRITING',
  'SPEAKING',
  'GRAMMAR',
  'VOCABULARY',
  'PRONUNCIATION',
  'MIXED',
] as const
export type ModuleSkill = (typeof MODULE_SKILLS)[number]

/** Block types shipped in v1. Other types declared but disabled at the UI level. */
export const BLOCK_TYPES_V1 = ['GRAMMAR_NOTE', 'READING'] as const

export const BLOCK_TYPES_ALL = [
  'GRAMMAR_NOTE',
  'READING',
  'AUDIO',
  'VIDEO',
  'QUIZ',
  'WRITING_PROMPT',
  'SPEAKING_PROMPT',
  'FLASHCARD_SET',
] as const
export type BlockType = (typeof BLOCK_TYPES_ALL)[number]

export function moduleStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Nháp'
    case 'IN_REVIEW':
      return 'Chờ duyệt'
    case 'PUBLISHED':
      return 'Đã xuất bản'
    case 'ARCHIVED':
      return 'Đã lưu trữ'
    default:
      return status
  }
}

export function blockTypeLabel(type: string): string {
  switch (type) {
    case 'GRAMMAR_NOTE':
      return 'Grammar note'
    case 'READING':
      return 'Reading'
    case 'AUDIO':
      return 'Audio'
    case 'VIDEO':
      return 'Video'
    case 'QUIZ':
      return 'Quiz'
    case 'WRITING_PROMPT':
      return 'Writing prompt'
    case 'SPEAKING_PROMPT':
      return 'Speaking prompt'
    case 'FLASHCARD_SET':
      return 'Flashcard set'
    default:
      return type
  }
}

/** Only PUBLISHED modules are visible to students. */
export function isModuleVisibleToStudents(status: string): boolean {
  return status === 'PUBLISHED'
}

export type BlockContent = {
  body?: string
  // future: audioUrl, videoUrl, questions, prompt, etc.
}

export function parseBlockContent(json: string | null | undefined): BlockContent {
  if (!json) return {}
  try {
    const parsed = JSON.parse(json)
    if (parsed && typeof parsed === 'object') return parsed as BlockContent
  } catch {
    // fall through
  }
  return {}
}
