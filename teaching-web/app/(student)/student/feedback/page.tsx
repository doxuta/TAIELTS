import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Sparkles } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const GLASS_BG = 'min-h-full bg-gradient-to-br from-violet-500/10 via-background to-emerald-500/10'
const GLASS_CARD = 'bg-card/60 backdrop-blur-xl border-white/10 shadow-lg'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  NEEDS_REWORK: 'destructive',
  OVERRIDDEN: 'outline',
}

export default async function StudentFeedbackInboxPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') redirect('/login')

  const list = await db.aIFeedback.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className={GLASS_BG}>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> AI feedback của bạn
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lưu lại các lần AI chấm. Giáo viên có thể review để confirm hoặc ghi chú thêm.
          </p>
        </header>

        {list.length === 0 ? (
          <Card className={GLASS_CARD}>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Chưa có feedback. Hoàn thành một WRITING_PROMPT hoặc SPEAKING_PROMPT trong Today Plan để
              AI chấm cho bạn.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {list.map((f) => (
              <li key={f.id}>
                <Card className={`${GLASS_CARD} transition-colors hover:border-primary/40`}>
                  <Link href={`/student/feedback/${f.id}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">{f.kind}</code>
                        <Badge variant={STATUS_VARIANT[f.teacherStatus] ?? 'secondary'}>
                          {f.teacherStatus.replaceAll('_', ' ')}
                        </Badge>
                        {f.overallBand != null && (
                          <span className="ml-auto font-bold tabular-nums">Band {f.overallBand.toFixed(1)}</span>
                        )}
                      </div>
                      {f.summaryFeedback && (
                        <p className="text-sm mt-2 line-clamp-2">{f.summaryFeedback}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(f.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
