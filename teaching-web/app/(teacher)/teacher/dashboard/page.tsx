import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ROADMAP_MONTHS, getSessionTypeLabel, getScoreEmoji } from '@/lib/utils'
import {
  BookOpen, Users, BarChart3, Calendar, Clock,
  TrendingUp, CheckCircle2, ArrowRight,
  Zap, Target, ClipboardList,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

async function getDashboardData(teacherId: string) {
  const students = await db.student.findMany({
    where: { teacherId },
    include: {
      user: { select: { name: true, email: true, image: true } },
      monthlyRubrics: { orderBy: { month: 'desc' }, take: 1 },
      lessonSessions: { orderBy: { date: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'asc' },
  })

  const totalSessions = await db.lessonSession.count({
    where: { student: { teacherId } },
  })

  return { students, totalSessions }
}

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions)
  const teacherId = session!.user.id

  const { students, totalSessions } = await getDashboardData(teacherId)

  const now = new Date()
  const currentHour = now.getHours()
  const greeting = currentHour < 12 ? 'Chào buổi sáng' : currentHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const todayFormatted = format(now, 'EEEE, dd MMMM yyyy', { locale: vi })
  const dayOfWeek = now.getDay()
  const sessionDay = dayOfWeek === 1 ? 'Thứ 2' : dayOfWeek === 3 ? 'Thứ 4' : dayOfWeek === 5 ? 'Thứ 6' : null

  const stats = [
    { label: 'Học viên', value: students.length, sub: '/ 10 tối đa', icon: Users },
    { label: 'Tổng buổi học', value: totalSessions, sub: 'tất cả học viên', icon: BookOpen },
    { label: 'Tháng hiện tại', value: students[0]?.currentMonth ?? 1, sub: '/ 12 tháng Năm 1', icon: Calendar },
    { label: 'Tuần hiện tại', value: students[0]?.currentWeek ?? 1, sub: '/ 52 tuần', icon: Target },
  ]

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground capitalize">{todayFormatted}</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
            {greeting}, {session?.user?.name?.split(' ')[0] ?? 'Matthew'} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {students.length === 0
              ? 'Chưa có học viên. Hãy thêm học viên đầu tiên!'
              : `Bạn đang quản lý ${students.length} học viên.${sessionDay ? ` Hôm nay là ${sessionDay} — ngày học.` : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/teacher/lessons">
              <BookOpen className="w-4 h-4 mr-1" /> Xem giáo án
            </Link>
          </Button>
          <Button asChild>
            <Link href="/teacher/lessons/new">
              <Zap className="w-4 h-4 mr-1" /> Soạn giáo án
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="w-4 h-4" />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Học viên</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/teacher/students">
                  Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có học viên</p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/teacher/students/new">Thêm học viên đầu tiên</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {students.map((student) => {
                  const rubric = student.monthlyRubrics[0]
                  const scores = [rubric?.grammarScore, rubric?.vocabularyScore, rubric?.listeningScore,
                    rubric?.speakingScore, rubric?.readingScore, rubric?.writingScore].filter((s): s is number => s != null && s > 0)
                  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
                  const monthData = ROADMAP_MONTHS[student.currentMonth] ?? ROADMAP_MONTHS[1]

                  return (
                    <li key={student.id}>
                      <Link
                        href={`/teacher/students/${student.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent/50 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{student.fullName}</p>
                            <Badge variant="secondary" className="text-[10px] h-5">T{student.currentMonth}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{monthData.grammar}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {avgScore ? (
                            <>
                              <p className="text-sm font-semibold">{getScoreEmoji(avgScore)} {avgScore.toFixed(1)}</p>
                              <p className="text-[10px] text-muted-foreground">điểm trung bình</p>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground/70">Chưa có dữ liệu</p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors ml-1" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-gradient-to-br from-primary to-violet-700 text-primary-foreground border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-medium opacity-60 mb-1">Lịch học</p>
                  <h3 className="text-base font-semibold">
                    {sessionDay ? `Tối nay — ${sessionDay}` : 'Không có buổi học hôm nay'}
                  </h3>
                </div>
                <Clock className="w-4 h-4 opacity-40" />
              </div>
              {sessionDay && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <CheckCircle2 className="w-4 h-4 opacity-40" /> 19:00 – 21:00 · Quán cà phê
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <BookOpen className="w-4 h-4 opacity-40" />
                    {students[0] ? getSessionTypeLabel(dayOfWeek === 1 ? 'A' : dayOfWeek === 3 ? 'B' : 'C') : 'Chưa có HV'}
                  </div>
                </div>
              )}
              <Link
                href="/teacher/lessons/new"
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-md transition-colors"
              >
                Soạn giáo án buổi này <ArrowRight className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">
                Chủ đề tháng này
              </p>
              {students[0] ? (() => {
                const data = ROADMAP_MONTHS[students[0].currentMonth] ?? ROADMAP_MONTHS[1]
                return (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground/80 uppercase tracking-wider mb-1">Ngữ pháp</p>
                      <p className="text-sm font-medium">{data.grammar}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground/80 uppercase tracking-wider mb-1">Từ vựng</p>
                      <p className="text-sm font-medium">{data.vocabulary}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <Badge>{data.focus}</Badge>
                    </div>
                  </div>
                )
              })() : (
                <p className="text-sm text-muted-foreground">Chưa có học viên</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">
                Thao tác nhanh
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: '/teacher/lessons/new', icon: BookOpen, label: 'Soạn giáo án' },
                  { href: '/teacher/assignments', icon: ClipboardList, label: 'Giao bài tập' },
                  { href: '/teacher/progress', icon: BarChart3, label: 'Xem tiến độ' },
                  { href: '/teacher/students', icon: Users, label: 'Hồ sơ HV' },
                ].map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className="flex items-center gap-2 p-2.5 rounded-md border bg-card hover:bg-accent/50 transition-colors text-xs font-medium group"
                  >
                    <action.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
