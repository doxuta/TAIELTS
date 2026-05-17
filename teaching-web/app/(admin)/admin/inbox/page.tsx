import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import {
  Inbox,
  BookMarked,
  Layers,
  Sparkles,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AdminInboxPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [pendingSources, pendingModules, pendingFeedback] = await Promise.all([
    db.source.findMany({
      where: { reviewStatus: 'PENDING_REVIEW' },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    }),
    db.learningModule.findMany({
      where: { status: 'IN_REVIEW' },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        _count: { select: { blocks: true } },
      },
    }),
    db.aIFeedback.findMany({
      where: {
        teacherStatus: { in: ['PENDING_REVIEW', 'NEEDS_REWORK'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ])

  const total = pendingSources.length + pendingModules.length + pendingFeedback.length

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Inbox className="w-6 h-6 text-primary" /> Content approval inbox
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total === 0 ? (
            <>Hộp thư rỗng. Mọi thứ đã được review.</>
          ) : (
            <>
              <strong className="text-foreground">{total}</strong> mục cần review:{' '}
              {pendingSources.length} source · {pendingModules.length} module ·{' '}
              {pendingFeedback.length} AI feedback.
            </>
          )}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          label="Sources"
          count={pendingSources.length}
          icon={BookMarked}
          href="/admin/sources?status=PENDING_REVIEW"
        />
        <SummaryTile
          label="Modules"
          count={pendingModules.length}
          icon={Layers}
          href="/admin/modules?status=IN_REVIEW"
        />
        <SummaryTile
          label="AI feedback"
          count={pendingFeedback.length}
          icon={Sparkles}
          href="/teacher/feedback?status=PENDING_REVIEW"
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Sources chờ review
        </h2>
        {pendingSources.length === 0 ? (
          <EmptyCard message="Không có source nào chờ review." />
        ) : (
          <ul className="space-y-2">
            {pendingSources.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/sources/${s.id}`}
                  className="block rounded-lg border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-accent/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[11px]">{s.type}</Badge>
                    <p className="font-medium text-sm truncate flex-1">{s.title}</p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(s.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.provider ?? '—'} · {s.trustLevel} · tạo bởi{' '}
                    {s.createdBy.name ?? s.createdBy.email}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Modules chờ approve
        </h2>
        {pendingModules.length === 0 ? (
          <EmptyCard message="Không có module nào chờ approve." />
        ) : (
          <ul className="space-y-2">
            {pendingModules.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/modules?status=IN_REVIEW`}
                  className="block rounded-lg border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-accent/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="warning">IN REVIEW</Badge>
                    <p className="font-medium text-sm truncate flex-1">{m.title}</p>
                    <span className="text-xs text-muted-foreground tabular-nums">v{m.version}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {m._count.blocks} block · {m.skill ?? '—'} · cập nhật{' '}
                    {new Date(m.updatedAt).toLocaleDateString('vi-VN')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          AI feedback chờ teacher duyệt
        </h2>
        {pendingFeedback.length === 0 ? (
          <EmptyCard message="Không có AI feedback nào chờ review." />
        ) : (
          <ul className="space-y-2">
            {pendingFeedback.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/teacher/feedback/${f.id}`}
                  className="block rounded-lg border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-accent/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">
                      {f.kind}
                    </code>
                    <Badge
                      variant={f.teacherStatus === 'NEEDS_REWORK' ? 'destructive' : 'warning'}
                    >
                      {f.teacherStatus.replaceAll('_', ' ')}
                    </Badge>
                    {f.overallBand != null && (
                      <span className="ml-auto text-xs font-bold tabular-nums">
                        Band {f.overallBand.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1 line-clamp-2">{f.summaryFeedback ?? '—'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {f.user.name ?? f.user.email} ·{' '}
                    {new Date(f.createdAt).toLocaleString('vi-VN')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function SummaryTile({
  label,
  count,
  icon: Icon,
  href,
}: {
  label: string
  count: number
  icon: typeof BookMarked
  href: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <Link href={href} className="absolute inset-0 z-10" aria-label={`Open ${label} queue`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">{count}</span>
          <span className="text-xs text-muted-foreground">chờ review</span>
          <ArrowUpRight className="w-4 h-4 ml-auto text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyCard({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  )
}
