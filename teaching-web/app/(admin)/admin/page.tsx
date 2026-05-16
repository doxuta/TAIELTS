import Link from 'next/link'
import { BookMarked, Users, Layers, ClipboardList, BookOpen, Sparkles } from 'lucide-react'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [
    usersByRole,
    sourcesByStatus,
    modulesByStatus,
    citationCount,
    feedbackByStatus,
    recentAudit,
  ] = await Promise.all([
    db.user.groupBy({ by: ['role'], _count: { _all: true } }),
    db.source.groupBy({ by: ['reviewStatus'], _count: { _all: true } }),
    db.learningModule.groupBy({ by: ['status'], _count: { _all: true } }),
    db.citation.count(),
    db.aIFeedback.groupBy({ by: ['teacherStatus'], _count: { _all: true } }),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { actor: { select: { name: true, email: true } } },
    }),
  ])

  const toMap = <K extends string>(arr: Array<{ _count: { _all: number } } & Record<K, string>>, key: K) =>
    Object.fromEntries(arr.map((r) => [r[key], r._count._all]))

  return {
    users: toMap(usersByRole, 'role'),
    sources: toMap(sourcesByStatus, 'reviewStatus'),
    modules: toMap(modulesByStatus, 'status'),
    citationCount,
    feedback: toMap(feedbackByStatus, 'teacherStatus'),
    recentAudit,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      href: '/admin/users',
      icon: Users,
      title: 'Users',
      lines: [
        `${stats.users.ADMIN ?? 0} admin`,
        `${stats.users.TEACHER ?? 0} teacher`,
        `${stats.users.STUDENT ?? 0} student`,
      ],
    },
    {
      href: '/admin/sources',
      icon: BookMarked,
      title: 'Sources',
      lines: [
        `${stats.sources.APPROVED ?? 0} approved`,
        `${stats.sources.PENDING_REVIEW ?? 0} pending`,
        `${stats.sources.DRAFT ?? 0} draft`,
        `${stats.sources.BLOCKED ?? 0} blocked`,
      ],
    },
    {
      href: '/builder/modules',
      icon: Layers,
      title: 'Modules',
      lines: [
        `${stats.modules.PUBLISHED ?? 0} published`,
        `${stats.modules.IN_REVIEW ?? 0} in review`,
        `${stats.modules.DRAFT ?? 0} draft`,
      ],
    },
    {
      href: '/admin/sources',
      icon: BookOpen,
      title: 'Citations',
      lines: [`${stats.citationCount} citations attached`],
    },
    {
      href: '/teacher/feedback',
      icon: Sparkles,
      title: 'AI feedback',
      lines: [
        `${stats.feedback.PENDING_REVIEW ?? 0} pending review`,
        `${stats.feedback.APPROVED ?? 0} approved`,
        `${stats.feedback.NEEDS_REWORK ?? 0} needs rework`,
      ],
    },
    {
      href: '/admin/audit',
      icon: ClipboardList,
      title: 'Audit log',
      lines: [`${stats.recentAudit.length} recent events`],
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink-primary">Admin overview</h1>
        <p className="text-sm text-ink-tertiary">
          Trạng thái hệ thống lúc {new Date().toLocaleString('vi-VN')}.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="rounded-xl border border-surface-border bg-surface-primary p-4 hover:border-brand-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <c.icon className="h-4 w-4 text-ink-tertiary" />
              <h2 className="font-semibold text-ink-primary">{c.title}</h2>
            </div>
            <ul className="text-xs text-ink-secondary space-y-0.5">
              {c.lines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-surface-border bg-surface-primary p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-ink-primary">Hoạt động gần nhất</h2>
          <Link href="/admin/audit" className="text-xs text-brand-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        {stats.recentAudit.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Chưa có hoạt động.</p>
        ) : (
          <ul className="space-y-1 text-xs text-ink-secondary">
            {stats.recentAudit.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-ink-primary">{a.action}</span>
                <span className="text-ink-tertiary">on {a.entityType}</span>
                <span className="text-ink-tertiary">
                  by {a.actor.name ?? a.actor.email} ·{' '}
                  {new Date(a.createdAt).toLocaleString('vi-VN')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
