import { ArrowUpRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

type RouteLike = {
  id: string
  routeType: string
  displayLabel: string
  locatorJson?: string | null
  learnerInstruction?: string | null
}

type SourceLike = {
  url?: string | null
}

function buildHref(route: RouteLike, source: SourceLike): string | null {
  if (!source.url) return null

  if (route.routeType === 'URL') return source.url
  if (route.routeType === 'TIMESTAMP') {
    const seconds = parseLocatorSeconds(route.locatorJson)
    if (seconds != null && source.url.includes('youtu')) {
      const sep = source.url.includes('?') ? '&' : '?'
      return `${source.url}${sep}t=${seconds}`
    }
  }
  return source.url
}

function parseLocatorSeconds(locatorJson: string | null | undefined): number | null {
  if (!locatorJson) return null
  try {
    const parsed = JSON.parse(locatorJson) as { seconds?: number; start?: number }
    if (typeof parsed.seconds === 'number') return parsed.seconds
    if (typeof parsed.start === 'number') return parsed.start
  } catch {
    return null
  }
  return null
}

export function SourceRouteButton({
  route,
  source,
  className,
}: {
  route: RouteLike
  source: SourceLike
  className?: string
}) {
  const href = buildHref(route, source)
  const baseClass = cn(
    'inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-secondary px-2.5 py-1 text-xs font-medium text-ink-primary hover:bg-surface-tertiary transition-colors',
    className
  )

  const content = (
    <>
      <MapPin className="h-3 w-3 text-ink-tertiary" />
      <span>{route.displayLabel}</span>
      {href && <ArrowUpRight className="h-3 w-3 text-ink-tertiary" />}
    </>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClass}>
        {content}
      </a>
    )
  }
  return <span className={baseClass}>{content}</span>
}
