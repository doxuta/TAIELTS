import type { SourceType, TrustLevel, LicenseStatus, ReviewStatus, RouteType } from '@/lib/sources'

export interface SourceSummary {
  id: string
  type: SourceType
  title: string
  provider: string | null
  url: string | null
  trustLevel: TrustLevel
  licenseStatus: LicenseStatus
  reviewStatus: ReviewStatus
  cefrLevel?: string | null
  targetBand?: number | null
  /** CSV of skill tags. Mobile should split on `,`. */
  skills?: string | null
  /** CSV of topic tags. */
  topics?: string | null
  lastVerifiedAt?: string | null
}

export interface SourceRouteSummary {
  id: string
  sourceId: string
  routeType: RouteType
  displayLabel: string
  /** Free-form JSON (page number, timestamp seconds, exercise id...). */
  locatorJson?: string | null
  teacherNote?: string | null
  learnerInstruction?: string | null
}

export interface CitationSummary {
  id: string
  claim: string | null
  displayMode: 'INLINE' | 'SOURCE_CARD' | 'TEACHER_ONLY'
  attachedToType: string
  attachedToId: string
  sourceRoute: SourceRouteSummary & { source: SourceSummary }
}
