export const SOURCE_TYPES = [
  'WEB',
  'BOOK',
  'AUDIO',
  'YOUTUBE',
  'EXERCISE',
  'DICTIONARY',
  'PDF',
  'PODCAST',
] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

export const TRUST_LEVELS = [
  'A_OFFICIAL',
  'B_TEACHER_APPROVED',
  'C_COMMUNITY',
  'D_BLOCKED',
] as const
export type TrustLevel = (typeof TRUST_LEVELS)[number]

export const LICENSE_STATUSES = [
  'LINK_ONLY',
  'EMBED_ALLOWED',
  'PUBLIC_DOMAIN',
  'CREATIVE_COMMONS',
  'LICENSED',
  'PAID_REQUIRED',
  'UNKNOWN',
] as const
export type LicenseStatus = (typeof LICENSE_STATUSES)[number]

export const REVIEW_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'DEPRECATED',
  'BLOCKED',
] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

export const ROUTE_TYPES = [
  'URL',
  'PAGE',
  'CHAPTER',
  'UNIT',
  'EXERCISE',
  'TIMESTAMP',
  'TRANSCRIPT_SEGMENT',
] as const
export type RouteType = (typeof ROUTE_TYPES)[number]

export const CITATION_ATTACHED_TO_TYPES = [
  'LESSON_PLAN',
  'ASSIGNMENT',
  'AI_FEEDBACK',
  'VOCAB_CARD',
  'ERROR_ENTRY',
  'LESSON_BLOCK',
] as const
export type CitationAttachedToType = (typeof CITATION_ATTACHED_TO_TYPES)[number]

export const CITATION_DISPLAY_MODES = ['INLINE', 'SOURCE_CARD', 'TEACHER_ONLY'] as const
export type CitationDisplayMode = (typeof CITATION_DISPLAY_MODES)[number]

/**
 * Sources that are blocked or deprecated must never be shown to students.
 */
export function isVisibleToStudents(reviewStatus: string, trustLevel: string): boolean {
  if (reviewStatus === 'BLOCKED' || reviewStatus === 'DEPRECATED' || reviewStatus === 'DRAFT') {
    return false
  }
  if (trustLevel === 'D_BLOCKED') return false
  return true
}

export function trustLabel(level: string): string {
  switch (level) {
    case 'A_OFFICIAL':
      return 'Official'
    case 'B_TEACHER_APPROVED':
      return 'Teacher-approved'
    case 'C_COMMUNITY':
      return 'Community'
    case 'D_BLOCKED':
      return 'Blocked'
    default:
      return level
  }
}

export function licenseLabel(status: string): string {
  switch (status) {
    case 'LINK_ONLY':
      return 'Link only'
    case 'EMBED_ALLOWED':
      return 'Embed allowed'
    case 'PUBLIC_DOMAIN':
      return 'Public domain'
    case 'CREATIVE_COMMONS':
      return 'Creative Commons'
    case 'LICENSED':
      return 'Licensed'
    case 'PAID_REQUIRED':
      return 'Paid'
    case 'UNKNOWN':
      return 'Unknown'
    default:
      return status
  }
}

export function reviewLabel(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft'
    case 'PENDING_REVIEW':
      return 'Pending review'
    case 'APPROVED':
      return 'Approved'
    case 'DEPRECATED':
      return 'Deprecated'
    case 'BLOCKED':
      return 'Blocked'
    default:
      return status
  }
}
