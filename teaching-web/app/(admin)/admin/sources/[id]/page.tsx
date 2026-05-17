import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { SourceCard } from '@/components/sources/SourceCard'
import { SourceRouteButton } from '@/components/sources/SourceRouteButton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/sources"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Sources
      </Link>

      <SourceCard source={source} showAdminControls>
        {source.description && (
          <p className="text-sm text-muted-foreground">{source.description}</p>
        )}
        <dl className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <Meta label="Author" value={source.author} />
          <Meta label="CEFR" value={source.cefrLevel} />
          <Meta
            label="Target band"
            value={source.targetBand != null ? source.targetBand.toFixed(1) : null}
          />
          <Meta
            label="Last verified"
            value={
              source.lastVerifiedAt
                ? new Date(source.lastVerifiedAt).toLocaleDateString('vi-VN')
                : null
            }
          />
          <Meta label="Skills" value={source.skills} className="col-span-2" />
          <Meta label="Topics" value={source.topics} className="col-span-2" />
        </dl>
      </SourceCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review</CardTitle>
          <CardDescription>
            Đổi trạng thái review của source. Hành động được ghi audit log.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ReviewControls sourceId={source.id} currentStatus={source.reviewStatus} />
          <p className="text-xs text-muted-foreground">
            Created by{' '}
            <span className="text-foreground">
              {source.createdBy.name ?? source.createdBy.email}
            </span>
            {source.reviewedBy && (
              <>
                {' · '}reviewed by{' '}
                <span className="text-foreground">
                  {source.reviewedBy.name ?? source.reviewedBy.email}
                </span>
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Routes ({source.routes.length})</CardTitle>
          <CardDescription>
            Mỗi route là một anchor (URL / page / timestamp) trỏ vào nội dung cụ thể của source.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {source.routes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có route. Thêm tối thiểu một route để có thể trích dẫn vào lesson hoặc
              module.
            </p>
          ) : (
            <ul className="space-y-2">
              {source.routes.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  <SourceRouteButton route={r} source={source} />
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {r.routeType}
                  </Badge>
                  {r.teacherNote && (
                    <span className="text-xs text-muted-foreground">{r.teacherNote}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <RouteEditor sourceId={source.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit log (recent)</CardTitle>
          <CardDescription>10 hành động gần nhất trên source này.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {recentAudit.length === 0 ? (
            <p className="px-6 text-sm text-muted-foreground">Chưa có hoạt động.</p>
          ) : (
            <ul className="divide-y">
              {recentAudit.map((a) => (
                <li key={a.id} className="px-6 py-3 flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {a.action}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {a.actor.name ?? a.actor.email} ·{' '}
                    {new Date(a.createdAt).toLocaleString('vi-VN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Meta({
  label,
  value,
  className,
}: {
  label: string
  value: string | null | undefined
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground mt-0.5">{value || '—'}</dd>
    </div>
  )
}
