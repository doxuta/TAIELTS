import Link from 'next/link'
import {
  BookMarked,
  Users,
  Layers,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  Quote,
  type LucideIcon,
} from 'lucide-react'
import { db } from '@/lib/db'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AdminCharts, type AdminChartsData } from './AdminCharts'

export const dynamic = 'force-dynamic'

async function getStats() {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  fourteenDaysAgo.setHours(0, 0, 0, 0)

  const [
    usersByRole,
    sourcesByStatus,
    modulesByStatus,
    citationCount,
    feedbackByStatus,
    recentAudit,
    recentUsers,
    recentFeedback,
  ] = await Promise.all([
    db.user.groupBy({ by: ['role'], _count: { _all: true } }),
    db.source.groupBy({ by: ['reviewStatus'], _count: { _all: true } }),
    db.learningModule.groupBy({ by: ['status'], _count: { _all: true } }),
    db.citation.count(),
    db.aIFeedback.groupBy({ by: ['teacherStatus'], _count: { _all: true } }),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { actor: { select: { name: true, email: true } } },
    }),
    db.user.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
    db.aIFeedback.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, teacherStatus: true },
    }),
  ])

  const toMap = <K extends string>(
    arr: Array<{ _count: { _all: number } } & Record<K, string>>,
    key: K
  ) => Object.fromEntries(arr.map((r) => [r[key], r._count._all]))

  // Build 14-day buckets
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    days.push(d.toISOString().slice(0, 10))
  }

  const signupsByDay = days.map((date) => ({
    date,
    users: recentUsers.filter((u) => u.createdAt.toISOString().slice(0, 10) === date).length,
  }))

  const feedbackByDay = days.map((date) => {
    const sameDay = recentFeedback.filter((f) => f.createdAt.toISOString().slice(0, 10) === date)
    return {
      date,
      total: sameDay.length,
      pending: sameDay.filter((f) => f.teacherStatus === 'PENDING_REVIEW').length,
    }
  })

  const chartsData: AdminChartsData = {
    sourcesByStatus: sourcesByStatus.map((s) => ({ name: s.reviewStatus, value: s._count._all })),
    modulesByStatus: modulesByStatus.map((m) => ({ name: m.status, value: m._count._all })),
    signupsByDay,
    feedbackByDay,
  }

  return {
    users: toMap(usersByRole, 'role'),
    sources: toMap(sourcesByStatus, 'reviewStatus'),
    modules: toMap(modulesByStatus, 'status'),
    citationCount,
    feedback: toMap(feedbackByStatus, 'teacherStatus'),
    recentAudit,
    chartsData,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const totalUsers =
    (stats.users.ADMIN ?? 0) + (stats.users.TEACHER ?? 0) + (stats.users.STUDENT ?? 0)
  const sourcesApproved = stats.sources.APPROVED ?? 0
  const totalSources =
    sourcesApproved +
    (stats.sources.PENDING_REVIEW ?? 0) +
    (stats.sources.DRAFT ?? 0) +
    (stats.sources.DEPRECATED ?? 0) +
    (stats.sources.BLOCKED ?? 0)
  const modulesPublished = stats.modules.PUBLISHED ?? 0
  const feedbackPending = stats.feedback.PENDING_REVIEW ?? 0

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trạng thái hệ thống lúc {new Date().toLocaleString('vi-VN')}.
        </p>
      </header>

      {/* KPI cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Users"
          value={totalUsers}
          icon={Users}
          sublines={[
            `${stats.users.ADMIN ?? 0} admin`,
            `${stats.users.TEACHER ?? 0} teacher`,
            `${stats.users.STUDENT ?? 0} student`,
          ]}
          href="/admin/users"
        />
        <KpiCard
          title="Sources"
          value={`${sourcesApproved}/${totalSources}`}
          subtitle="approved / total"
          icon={BookMarked}
          sublines={[
            `${stats.sources.PENDING_REVIEW ?? 0} pending`,
            `${stats.sources.DRAFT ?? 0} draft`,
            `${stats.sources.BLOCKED ?? 0} blocked`,
          ]}
          href="/admin/sources"
        />
        <KpiCard
          title="Modules"
          value={modulesPublished}
          subtitle="published"
          icon={Layers}
          sublines={[
            `${stats.modules.IN_REVIEW ?? 0} in review`,
            `${stats.modules.DRAFT ?? 0} draft`,
            `${stats.modules.ARCHIVED ?? 0} archived`,
          ]}
          href="/builder/modules"
        />
        <KpiCard
          title="AI feedback"
          value={feedbackPending}
          subtitle="pending review"
          icon={Sparkles}
          sublines={[
            `${stats.feedback.APPROVED ?? 0} approved`,
            `${stats.feedback.NEEDS_REWORK ?? 0} rework`,
            `${stats.feedback.OVERRIDDEN ?? 0} overridden`,
          ]}
          href="/teacher/feedback"
          warningWhen={feedbackPending > 0}
        />
      </section>

      <AdminCharts data={stats.chartsData} />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Hoạt động gần nhất</CardTitle>
              <CardDescription>
                {stats.recentAudit.length} event mới nhất từ admin / builder
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/audit">
                Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            {stats.recentAudit.length === 0 ? (
              <p className="px-6 text-sm text-muted-foreground">Chưa có hoạt động.</p>
            ) : (
              <ul className="divide-y">
                {stats.recentAudit.map((a) => (
                  <li
                    key={a.id}
                    className="px-6 py-3 flex flex-wrap items-center gap-2 text-sm"
                  >
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {a.action}
                    </Badge>
                    <span className="text-muted-foreground">on</span>
                    <span className="font-medium">{a.entityType}</span>
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

        {/* Quick tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Quote className="h-4 w-4 text-muted-foreground" /> Nguyên tắc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Mọi <strong className="text-foreground">approve / block / publish</strong>{' '}
              đều ghi audit log.
            </p>
            <Separator />
            <p>
              Source ở trạng thái <strong className="text-foreground">BLOCKED</strong>{' '}
              hoặc <strong className="text-foreground">DEPRECATED</strong> sẽ bị server
              tự ẩn khỏi mọi response của học viên.
            </p>
            <Separator />
            <p>
              <strong className="text-foreground">{stats.citationCount}</strong>{' '}
              citation đang gắn vào lesson / block / AI feedback trên toàn hệ thống.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/admin/sources">
                <ClipboardList className="h-3.5 w-3.5" /> Quản lý sources
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  sublines,
  href,
  warningWhen,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  sublines: string[]
  href: string
  warningWhen?: boolean
}) {
  return (
    <Card className="relative overflow-hidden">
      <Link
        href={href}
        className="absolute inset-0 z-10"
        aria-label={`Open ${title}`}
      />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
          {warningWhen && (
            <Badge variant="warning" className="ml-auto">
              cần review
            </Badge>
          )}
        </div>
        <ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
          {sublines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
