import { cn } from '@/lib/utils'
import {
  trustLabel,
  licenseLabel,
  reviewLabel,
  type TrustLevel,
  type LicenseStatus,
  type ReviewStatus,
} from '@/lib/sources'

const TRUST_COLORS: Record<string, string> = {
  A_OFFICIAL: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B_TEACHER_APPROVED: 'bg-sky-100 text-sky-700 border-sky-200',
  C_COMMUNITY: 'bg-amber-100 text-amber-700 border-amber-200',
  D_BLOCKED: 'bg-red-100 text-red-700 border-red-200',
}

const LICENSE_COLORS: Record<string, string> = {
  PUBLIC_DOMAIN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CREATIVE_COMMONS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  EMBED_ALLOWED: 'bg-sky-100 text-sky-700 border-sky-200',
  LINK_ONLY: 'bg-slate-100 text-slate-700 border-slate-200',
  LICENSED: 'bg-violet-100 text-violet-700 border-violet-200',
  PAID_REQUIRED: 'bg-amber-100 text-amber-700 border-amber-200',
  UNKNOWN: 'bg-slate-100 text-slate-500 border-slate-200',
}

const REVIEW_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  DEPRECATED: 'bg-orange-100 text-orange-700 border-orange-200',
  BLOCKED: 'bg-red-100 text-red-700 border-red-200',
}

const BASE_CLASS =
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide'

export function TrustBadge({ level, className }: { level: TrustLevel | string; className?: string }) {
  return (
    <span className={cn(BASE_CLASS, TRUST_COLORS[level] ?? TRUST_COLORS.C_COMMUNITY, className)}>
      {trustLabel(level)}
    </span>
  )
}

export function LicenseBadge({
  status,
  className,
}: {
  status: LicenseStatus | string
  className?: string
}) {
  return (
    <span className={cn(BASE_CLASS, LICENSE_COLORS[status] ?? LICENSE_COLORS.UNKNOWN, className)}>
      {licenseLabel(status)}
    </span>
  )
}

export function ReviewBadge({
  status,
  className,
}: {
  status: ReviewStatus | string
  className?: string
}) {
  return (
    <span className={cn(BASE_CLASS, REVIEW_COLORS[status] ?? REVIEW_COLORS.DRAFT, className)}>
      {reviewLabel(status)}
    </span>
  )
}
