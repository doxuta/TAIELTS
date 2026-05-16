import Link from 'next/link'
import { ExternalLink, BookOpen, Headphones, Globe, Youtube, FileText, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TrustBadge, LicenseBadge, ReviewBadge } from './badges'

type SourceLike = {
  id: string
  type: string
  title: string
  provider?: string | null
  url?: string | null
  trustLevel: string
  licenseStatus: string
  reviewStatus: string
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  WEB: Globe,
  BOOK: BookOpen,
  AUDIO: Headphones,
  PODCAST: Headphones,
  YOUTUBE: Youtube,
  EXERCISE: GraduationCap,
  DICTIONARY: BookOpen,
  PDF: FileText,
}

interface SourceCardProps {
  source: SourceLike
  showAdminControls?: boolean
  href?: string
  className?: string
  /** When true, render a compact horizontal version (used inside lists/citations). */
  compact?: boolean
  children?: React.ReactNode
}

export function SourceCard({
  source,
  showAdminControls,
  href,
  className,
  compact,
  children,
}: SourceCardProps) {
  const Icon = TYPE_ICONS[source.type] ?? Globe
  const titleNode = href ? (
    <Link href={href} className="hover:text-brand-600 transition-colors">
      {source.title}
    </Link>
  ) : (
    <span>{source.title}</span>
  )

  return (
    <article
      className={cn(
        'rounded-xl border border-surface-border bg-surface-primary p-3 shadow-sm',
        compact && 'p-2.5',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-surface-tertiary p-2 text-ink-secondary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('font-semibold text-ink-primary', compact ? 'text-sm' : 'text-base')}>
              {titleNode}
            </h3>
            <TrustBadge level={source.trustLevel} />
            {showAdminControls && (
              <>
                <LicenseBadge status={source.licenseStatus} />
                <ReviewBadge status={source.reviewStatus} />
              </>
            )}
          </div>
          {source.provider && (
            <p className="mt-0.5 text-xs text-ink-tertiary">{source.provider}</p>
          )}
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{source.url}</span>
            </a>
          )}
          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>
    </article>
  )
}
