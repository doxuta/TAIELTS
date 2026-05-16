import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = ['ALL', 'PENDING_REVIEW', 'APPROVED', 'NEEDS_REWORK', 'OVERRIDDEN'] as const

interface PageProps {
  searchParams: { status?: string }
}

export default async function TeacherFeedbackListPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  if (role !== 'TEACHER' && role !== 'ADMIN') redirect('/login')

  const status = searchParams.status
  const where: Record<string, unknown> = {}
  if (status && status !== 'ALL') where.teacherStatus = status

  const list = await db.aIFeedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
    },
  })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-ink-primary">AI feedback inbox</h1>
        <p className="text-sm text-ink-tertiary">100 lần chấm AI gần nhất. Review trước khi học viên dùng.</p>
      </header>

      <div className="flex gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f}
            href={`/teacher/feedback?status=${f}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              (status ?? 'ALL') === f
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-surface-primary border-surface-border text-ink-secondary hover:bg-surface-tertiary'
            }`}
          >
            {f.replaceAll('_', ' ')}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-ink-tertiary">Không có feedback nào.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((f) => (
            <li key={f.id}>
              <Link
                href={`/teacher/feedback/${f.id}`}
                className="block rounded-xl border border-surface-border bg-surface-primary p-3 hover:border-brand-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-ink-tertiary">{f.kind}</span>
                  <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-secondary">
                    {f.teacherStatus.replaceAll('_', ' ')}
                  </span>
                  {f.overallBand != null && (
                    <span className="ml-auto font-bold text-ink-primary">
                      Band {f.overallBand.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink-primary mt-1 line-clamp-2">
                  {f.summaryFeedback ?? '—'}
                </p>
                <p className="text-xs text-ink-tertiary mt-1">
                  {f.user.name ?? f.user.email} ·{' '}
                  {new Date(f.createdAt).toLocaleString('vi-VN')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
