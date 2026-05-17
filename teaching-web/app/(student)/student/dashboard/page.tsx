import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROADMAP_MONTHS } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { Target, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const GLASS_BG = 'min-h-full bg-gradient-to-br from-violet-500/10 via-background to-emerald-500/10'
const GLASS_CARD = 'bg-card/60 backdrop-blur-xl border-white/10 shadow-lg'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)

  const studentProfile = await db.student.findFirst({
    where: { userId: session!.user.id },
    include: {
      monthlyRubrics: { orderBy: { month: 'desc' }, take: 1 },
      lessonSessions: {
        orderBy: { date: 'desc' },
        take: 5,
        include: { lessonPlan: true },
      },
      assignments: {
        where: { submittedAt: null },
        include: { assignment: true },
        take: 3,
      },
    },
  })

  if (!studentProfile) {
    return (
      <div className={GLASS_BG}>
        <div className="p-8 text-center text-sm text-muted-foreground">
          Tài khoản học viên chưa được liên kết. Liên hệ giáo viên.
        </div>
      </div>
    )
  }

  const rubric = studentProfile.monthlyRubrics[0]
  const monthData = ROADMAP_MONTHS[studentProfile.currentMonth] ?? ROADMAP_MONTHS[1]
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const todayDay = now.getDay()
  const isLessonDay = [1, 3, 5].includes(todayDay)

  const SKILL_KEYS = ['grammarScore', 'vocabularyScore', 'listeningScore', 'speakingScore', 'readingScore', 'writingScore'] as const
  const SKILL_LABELS = ['Ngữ pháp', 'Từ vựng', 'Nghe', 'Nói', 'Đọc', 'Viết']

  const SESSION_BADGE: Record<string, string> = {
    A: 'bg-violet-500/15 text-violet-500',
    B: 'bg-sky-500/15 text-sky-500',
    C: 'bg-emerald-500/15 text-emerald-500',
  }

  return (
    <div className={GLASS_BG}>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
        <header>
          <p className="text-sm text-muted-foreground mb-1 capitalize">
            {format(now, 'EEEE, dd MMMM', { locale: vi })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {greeting}, {session?.user?.name?.split(' ')[0]} 📚
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tháng {studentProfile.currentMonth}/12 · Tuần {studentProfile.currentWeek} · {monthData.grammar}
          </p>
        </header>

        {isLessonDay && (
          <Card className={`${GLASS_CARD} border-primary/30 bg-gradient-to-r from-primary/15 to-violet-500/10`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-primary/15 flex items-center justify-center text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Hôm nay có buổi học!</p>
                <p className="text-xs text-muted-foreground">
                  19:00 – 21:00 · {todayDay === 1 ? 'Thứ 2' : todayDay === 3 ? 'Thứ 4' : 'Thứ 6'} · Quán cà phê
                </p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/student/lessons">
                  Xem giáo án <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-4">
            <Card className={GLASS_CARD}>
              <CardContent className="p-5 md:p-6">
                <h2 className="text-sm font-semibold mb-4">
                  Tiến độ 6 kỹ năng — Tháng {studentProfile.currentMonth}
                </h2>
                {rubric ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SKILL_KEYS.map((k, i) => {
                      const score = rubric[k] ?? 0
                      const pct = (score / 5) * 100
                      const color =
                        score >= 4 ? 'bg-emerald-500'
                        : score >= 3 ? 'bg-primary'
                        : score >= 2 ? 'bg-amber-500'
                        : 'bg-red-500'
                      return (
                        <div key={k} className="p-3 rounded-md bg-background/40 border border-white/5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{SKILL_LABELS[i]}</p>
                          <p className="text-xl font-bold tabular-nums mb-2">{score > 0 ? score.toFixed(1) : '—'}</p>
                          <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Chưa có điểm tháng này</p>
                    <p className="text-xs mt-1">Điểm sẽ được cập nhật sau bài kiểm tra cuối tháng.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={GLASS_CARD}>
              <CardContent className="p-5 md:p-6">
                <h2 className="text-sm font-semibold mb-4">Buổi học gần đây</h2>
                {studentProfile.lessonSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Chưa có buổi học nào được ghi nhận.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {studentProfile.lessonSessions.map(s => (
                      <li key={s.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent/30 transition-colors">
                        <div className={cn(
                          'w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold',
                          SESSION_BADGE[s.sessionType] ?? SESSION_BADGE.A
                        )}>
                          {s.sessionType}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.lessonPlan?.title ?? `Buổi ${s.sessionType}`}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(s.date), 'dd/MM/yyyy', { locale: vi })}</p>
                        </div>
                        {s.attended && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <Card className={GLASS_CARD}>
              <CardContent className="p-5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">
                  Đang học — Tháng {studentProfile.currentMonth}
                </p>
                <div className="space-y-2">
                  <div className="p-3 rounded-md bg-primary/10 border border-primary/30">
                    <p className="text-[10px] text-primary uppercase mb-1">Ngữ pháp</p>
                    <p className="text-sm font-medium">{monthData.grammar}</p>
                  </div>
                  <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30">
                    <p className="text-[10px] text-amber-500 uppercase mb-1">Từ vựng</p>
                    <p className="text-sm font-medium">{monthData.vocabulary}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30 border">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Trọng tâm</p>
                    <p className="text-sm font-medium">{monthData.focus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={GLASS_CARD}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold">Bài tập chưa nộp</p>
                  <Link href="/student/assignments" className="text-xs text-primary">Xem tất cả</Link>
                </div>
                {studentProfile.assignments.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Không có bài tập chưa nộp 🎉</p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {studentProfile.assignments.map(sa => (
                      <li key={sa.assignmentId}>
                        <Link
                          href={`/student/assignments/${sa.assignmentId}`}
                          className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-accent/30 transition-colors"
                        >
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium">{sa.assignment.title}</p>
                            {sa.assignment.dueDate && (
                              <p className="text-[10px] text-red-500 mt-0.5">
                                Hạn: {format(new Date(sa.assignment.dueDate), 'dd/MM')}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className={GLASS_CARD}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                  Truy cập nhanh
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { href: '/student/vocab', label: '📚 Từ vựng' },
                    { href: '/student/strategies', label: '🗺️ Chiến lược' },
                    { href: '/student/feedback', label: '✨ AI feedback' },
                    { href: '/student/journal', label: '📓 Nhật ký' },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      className="p-2.5 rounded-md bg-background/40 hover:bg-background/60 border text-xs font-medium text-muted-foreground hover:text-foreground transition-all text-center"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
