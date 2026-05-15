import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ROADMAP_MONTHS, getSessionTypeLabel, getScoreEmoji } from '@/lib/utils'
import {
  BookOpen, Users, BarChart3, Calendar, Clock,
  TrendingUp, CheckCircle2, ArrowRight,
  Zap, Target, ClipboardList
} from 'lucide-react'
import Link from 'next/link'

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
  const todayFormatted = format(now, "EEEE, dd MMMM yyyy", { locale: vi })
  const dayOfWeek = now.getDay()
  const sessionDay = dayOfWeek === 1 ? 'Thứ 2' : dayOfWeek === 3 ? 'Thứ 4' : dayOfWeek === 5 ? 'Thứ 6' : null

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up mb-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-ink-tertiary capitalize mb-1">{todayFormatted}</p>
            <h1 className="text-3xl font-display font-bold text-ink tracking-tight">
              {greeting}, {session?.user?.name?.split(' ')[0] ?? 'Matthew'} 👋
            </h1>
            <p className="text-ink-secondary mt-1">
              {students.length === 0
                ? 'Chưa có học viên. Hãy thêm học viên đầu tiên!'
                : `Bạn đang quản lý ${students.length} học viên.${sessionDay ? ` Hôm nay là ${sessionDay} — ngày học.` : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/teacher/lessons" className="btn-secondary">
              <BookOpen className="w-4 h-4" /> Xem giáo án
            </Link>
            <Link href="/teacher/lessons/new" className="btn-primary">
              <Zap className="w-4 h-4" /> Soạn giáo án
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Học viên', value: students.length, sub: `/ 10 tối đa`, icon: Users, color: 'text-brand-500', bg: 'bg-brand-50' },
          { label: 'Tổng buổi học', value: totalSessions, sub: 'tất cả học viên', icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Tháng hiện tại', value: students[0]?.currentMonth ?? 1, sub: '/ 12 tháng Năm 1', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Tuần hiện tại', value: students[0]?.currentWeek ?? 1, sub: '/ 52 tuần', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className={`stat-card animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-ink-placeholder" />
            </div>
            <p className="text-2xl font-display font-bold text-ink mb-0.5">{stat.value}</p>
            <p className="text-xs text-ink-tertiary">{stat.label}</p>
            <p className="text-[10px] text-ink-placeholder mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Students */}
        <div className="col-span-7 card p-6 animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-ink">Học viên</h2>
            <Link href="/teacher/students" className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12 text-ink-tertiary">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chưa có học viên</p>
              <Link href="/teacher/students/new" className="btn-primary mt-4 text-sm inline-flex">
                Thêm học viên đầu tiên
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const rubric = student.monthlyRubrics[0]
                const scores = [rubric?.grammarScore, rubric?.vocabularyScore, rubric?.listeningScore,
                  rubric?.speakingScore, rubric?.readingScore, rubric?.writingScore].filter((s): s is number => s != null && s > 0)
                const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
                const monthData = ROADMAP_MONTHS[student.currentMonth] ?? ROADMAP_MONTHS[1]

                return (
                  <Link key={student.id} href={`/teacher/students/${student.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-secondary transition-colors group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {student.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink">{student.fullName}</p>
                        <span className="badge-brand">T{student.currentMonth}</span>
                      </div>
                      <p className="text-xs text-ink-tertiary truncate mt-0.5">{monthData.grammar}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {avgScore ? (
                        <>
                          <p className="text-sm font-semibold text-ink">{getScoreEmoji(avgScore)} {avgScore.toFixed(1)}</p>
                          <p className="text-[10px] text-ink-tertiary">điểm trung bình</p>
                        </>
                      ) : (
                        <p className="text-xs text-ink-placeholder">Chưa có dữ liệu</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-placeholder group-hover:text-brand-500 transition-colors ml-1" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col-span-5 space-y-5">
          {/* Today's Session */}
          <div className="card p-5 animate-fade-up stagger-3 bg-gradient-to-br from-brand-600 to-violet-700 border-none text-white shadow-glow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider font-medium mb-1">Lịch học</p>
                <h3 className="text-base font-display font-semibold">
                  {sessionDay ? `Tối nay — ${sessionDay}` : 'Không có buổi học hôm nay'}
                </h3>
              </div>
              <Clock className="w-4 h-4 text-white/40" />
            </div>
            {sessionDay && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-white/40" />
                  19:00 – 21:00 · Quán cà phê
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <BookOpen className="w-4 h-4 text-white/40" />
                  {students[0] ? getSessionTypeLabel(dayOfWeek === 1 ? 'A' : dayOfWeek === 3 ? 'B' : 'C') : 'Chưa có HV'}
                </div>
              </div>
            )}
            <Link href="/teacher/lessons/new" className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              Soạn giáo án buổi này <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Current Month Topic */}
          <div className="card p-5 animate-fade-up stagger-4">
            <p className="text-xs text-ink-tertiary uppercase tracking-wider font-medium mb-3">Chủ đề tháng này</p>
            {students[0] ? (() => {
              const data = ROADMAP_MONTHS[students[0].currentMonth] ?? ROADMAP_MONTHS[1]
              return (
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-ink-placeholder uppercase tracking-wider mb-1">Ngữ pháp</p>
                    <p className="text-sm font-medium text-ink">{data.grammar}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-placeholder uppercase tracking-wider mb-1">Từ vựng</p>
                    <p className="text-sm font-medium text-ink">{data.vocabulary}</p>
                  </div>
                  <div className="pt-2 border-t border-surface-border">
                    <span className="badge-brand">{data.focus}</span>
                  </div>
                </div>
              )
            })() : (
              <p className="text-sm text-ink-tertiary">Chưa có học viên</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-5 animate-fade-up stagger-5">
            <p className="text-xs text-ink-tertiary uppercase tracking-wider font-medium mb-3">Thao tác nhanh</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/teacher/lessons/new', icon: BookOpen, label: 'Soạn giáo án' },
                { href: '/teacher/assignments', icon: ClipboardList, label: 'Giao bài tập' },
                { href: '/teacher/progress', icon: BarChart3, label: 'Xem tiến độ' },
                { href: '/teacher/students', icon: Users, label: 'Hồ sơ HV' },
              ].map((action, i) => (
                <Link key={i} href={action.href}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-surface-secondary border border-surface-border hover:border-brand-200 transition-all text-xs font-medium text-ink-secondary hover:text-brand-600 group"
                >
                  <action.icon className="w-3.5 h-3.5 group-hover:text-brand-500 transition-colors" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
