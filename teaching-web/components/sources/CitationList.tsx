import { SourceCard } from './SourceCard'
import { SourceRouteButton } from './SourceRouteButton'
import { isVisibleToStudents } from '@/lib/sources'

export type CitationWithSource = {
  id: string
  claim: string | null
  displayMode: string
  sourceRoute: {
    id: string
    routeType: string
    displayLabel: string
    locatorJson: string | null
    learnerInstruction: string | null
    source: {
      id: string
      type: string
      title: string
      provider: string | null
      url: string | null
      trustLevel: string
      licenseStatus: string
      reviewStatus: string
    }
  }
}

interface Props {
  citations: CitationWithSource[]
  viewerRole: 'ADMIN' | 'TEACHER' | 'STUDENT' | string
  emptyMessage?: string
}

export function CitationList({ citations, viewerRole, emptyMessage }: Props) {
  const isStaff = viewerRole === 'ADMIN' || viewerRole === 'TEACHER'

  const visible = citations.filter((c) => {
    if (c.displayMode === 'TEACHER_ONLY' && !isStaff) return false
    if (!isStaff && !isVisibleToStudents(c.sourceRoute.source.reviewStatus, c.sourceRoute.source.trustLevel)) {
      return false
    }
    return true
  })

  if (visible.length === 0) {
    return (
      <p className="text-sm text-ink-tertiary">
        {emptyMessage ?? 'Chưa có nguồn tham chiếu.'}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {visible.map((c) => (
        <li key={c.id}>
          <SourceCard
            source={c.sourceRoute.source}
            showAdminControls={isStaff}
            compact
          >
            <div className="flex flex-wrap items-center gap-2">
              <SourceRouteButton route={c.sourceRoute} source={c.sourceRoute.source} />
              {c.claim && <span className="text-xs text-ink-secondary">{c.claim}</span>}
            </div>
            {c.sourceRoute.learnerInstruction && (
              <p className="mt-1 text-xs text-ink-secondary">
                {c.sourceRoute.learnerInstruction}
              </p>
            )}
          </SourceCard>
        </li>
      ))}
    </ul>
  )
}
