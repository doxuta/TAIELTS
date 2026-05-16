import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { SourceCard } from '@/components/sources/SourceCard'
import { SourceRouteButton } from '@/components/sources/SourceRouteButton'
import { ReviewControls } from './ReviewControls'
import { RouteEditor } from './RouteEditor'

export const dynamic = 'force-dynamic'

export default async function AdminSourceDetailPage({ params }: { params: { id: string } }) {
  const source = await db.source.findUnique({
    where: { id: params.id },
    include: {
      routes: { orderBy: { createdAt: 'asc' } },
      createdBy: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
  })
  if (!source) notFound()

  const recentAudit = await db.auditLog.findMany({
    where: { entityType: 'SOURCE', entityId: source.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { actor: { select: { name: true, email: true } } },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <Link
        href="/admin/sources"
        className="inline-flex items-center gap-1 text-sm text-ink-tertiary hover:text-ink-primary"
      >
        <ArrowLeft className="h-3 w-3" /> Back to list
      </Link>

      <SourceCard source={source} showAdminControls>
        {source.description && (
          <p className="text-sm text-ink-secondary">{source.description}</p>
        )}
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-ink-tertiary md:grid-cols-4">
          <div>
            <div className="text-ink-secondary">Author</div>
            <div>{source.author || '—'}</div>
          </div>
          <div>
            <div className="text-ink-secondary">CEFR</div>
            <div>{source.cefrLevel || '—'}</div>
          </div>
          <div>
            <div className="text-ink-secondary">Target band</div>
            <div>{source.targetBand?.toFixed(1) ?? '—'}</div>
          </div>
          <div>
            <div className="text-ink-secondary">Last verified</div>
            <div>{source.lastVerifiedAt ? new Date(source.lastVerifiedAt).toLocaleDateString('vi-VN') : '—'}</div>
          </div>
          <div className="col-span-2 md:col-span-2">
            <div className="text-ink-secondary">Skills</div>
            <div>{source.skills || '—'}</div>
          </div>
          <div className="col-span-2 md:col-span-2">
            <div className="text-ink-secondary">Topics</div>
            <div>{source.topics || '—'}</div>
          </div>
        </div>
      </SourceCard>

      <section className="rounded-xl border border-surface-border bg-surface-primary p-4">
        <h2 className="font-semibold text-ink-primary mb-2">Review</h2>
        <ReviewControls sourceId={source.id} currentStatus={source.reviewStatus} />
        <p className="mt-2 text-xs text-ink-tertiary">
          Created by {source.createdBy.name ?? source.createdBy.email}
          {source.reviewedBy && (
            <> · Reviewed by {source.reviewedBy.name ?? source.reviewedBy.email}</>
          )}
        </p>
      </section>

      <section className="rounded-xl border border-surface-border bg-surface-primary p-4">
        <h2 className="font-semibold text-ink-primary mb-3">Routes ({source.routes.length})</h2>
        {source.routes.length === 0 ? (
          <p className="text-sm text-ink-tertiary mb-3">
            Chưa có route. Thêm tối thiểu một route (URL/PAGE/CHAPTER/TIMESTAMP...) để có thể trích dẫn vào lesson.
          </p>
        ) : (
          <ul className="space-y-2 mb-4">
            {source.routes.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-surface-border bg-surface-secondary px-3 py-2 text-sm"
              >
                <SourceRouteButton route={r} source={source} />
                <div className="min-w-0 flex-1 text-xs text-ink-tertiary">
                  <span className="font-mono uppercase">{r.routeType}</span>
                  {r.teacherNote && <span> · {r.teacherNote}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <RouteEditor sourceId={source.id} />
      </section>

      <section className="rounded-xl border border-surface-border bg-surface-primary p-4">
        <h2 className="font-semibold text-ink-primary mb-2">Audit log (recent)</h2>
        {recentAudit.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Chưa có hoạt động.</p>
        ) : (
          <ul className="space-y-1 text-xs text-ink-secondary">
            {recentAudit.map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <span className="font-mono text-ink-primary">{a.action}</span>
                <span className="text-ink-tertiary">
                  by {a.actor.name ?? a.actor.email} · {new Date(a.createdAt).toLocaleString('vi-VN')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
