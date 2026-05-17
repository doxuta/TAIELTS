import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getSessionTypeLabel, formatDate } from '@/lib/utils'
import { BookOpen, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SESSION_BADGE: Record<string, string> = {
  A: 'bg-violet-500/15 text-violet-500 border-violet-500/30',
  B: 'bg-sky-500/15 text-sky-500 border-sky-500/30',
  C: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
}

export default async function StudentLessonsPage() {
  const session = await getServerSession(authOptions)

  const student = await db.student.findFirst({
    where: { userId: session!.user.id },
    include: {
      lessonSessions: {
        orderBy: { date: 'desc' },
        include: { lessonPlan: true },
        take: 30,
      },
    },
  })

  if (!student) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Chưa có thông tin học viên.</div>
  }

  const upcoming = student.lessonSessions.filter(s => !s.attended && !s.homeworkDone)
  const past = student.lessonSessions.filter(s => s.attended)

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Buổi học & Bài tập</h1>
        <p className="text-sm text-muted-foreground mt-1">{past.length} buổi đã học · Tháng {student.currentMonth}/12</p>
      </header>

      {upcoming.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Bài tập chưa nộp ({upcoming.length})
          </h2>
          {upcoming.map(s => (
            <Card key={s.id} className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold',
                      SESSION_BADGE[s.sessionType]
                    )}>
                      Buổi {s.sessionType}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(s.date)}</span>
                  </div>
                  {s.homework && (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {s.homework}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Lịch sử buổi học
        </h2>
        {past.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Chưa có buổi học nào được ghi nhận.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {past.map(s => (
              <li key={s.id}>
                <Card>
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold',
                            SESSION_BADGE[s.sessionType]
                          )}>
                            {getSessionTypeLabel(s.sessionType as 'A' | 'B' | 'C').split('—')[0].trim()}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatDate(s.date)}</span>
                        </div>
                        {s.lessonPlan && (
                          <p className="text-sm font-medium">{s.lessonPlan.title}</p>
                        )}
                        {s.homework && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.homework}</p>
                        )}
                      </div>
                    </div>
                    {s.quality && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Chất lượng</p>
                        <p className="text-base font-bold text-primary tabular-nums">{s.quality}/5</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
