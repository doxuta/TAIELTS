import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Sparkles } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = ['ALL', 'PENDING_REVIEW', 'APPROVED', 'NEEDS_REWORK', 'OVERRIDDEN'] as const

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  NEEDS_REWORK: 'destructive',
  OVERRIDDEN: 'outline',
}

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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> AI feedback inbox
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          100 lần chấm AI gần nhất. Review trước khi học viên dùng.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = (status ?? 'ALL') === f
          return (
            <Button
              key={f}
              asChild
              size="sm"
              variant={active ? 'default' : 'outline'}
            >
              <Link href={`/teacher/feedback?status=${f}`}>
                {f.replaceAll('_', ' ')}
              </Link>
            </Button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Không có feedback nào.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {list.map((f) => (
            <li key={f.id}>
              <Link
                href={`/teacher/feedback/${f.id}`}
                className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">{f.kind}</code>
                  <Badge variant={STATUS_VARIANT[f.teacherStatus] ?? 'secondary'}>
                    {f.teacherStatus.replaceAll('_', ' ')}
                  </Badge>
                  {f.overallBand != null && (
                    <span className="ml-auto font-bold tabular-nums">
                      Band {f.overallBand.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-2 line-clamp-2">
                  {f.summaryFeedback ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
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
