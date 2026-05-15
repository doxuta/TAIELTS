import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROADMAP_MONTHS, getSessionTypeLabel } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { BookOpen, Target, Award, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'

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
      <div className="p-8 text-center">
        <p className="text-ink-secondary">Tài khoản học viên chưa được liên kết. Liên hệ giáo viên.</p>
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="animate-fade-up mb-8">
        <p className="text-sm text-ink-tertiary mb-1">
          {format(now, "EEEE, dd MMMM", { locale: vi })}
        </p>
        <h1 className="text-3xl font-display font-bold text-ink">
          {greeting}, {session?.user?.name?.split(' ')[0]} 📚
        </h1>
        <p className="text-ink-secondary mt-1">
          Tháng {studentProfile.currentMonth}/12 · Tuần {studentProfile.currentWeek} · {monthData.grammar}
        </p>
      </div>

      {/* Today lesson alert */}
      {isLessonDay && (
        <div className="card p-4 mb-6 bg-gradient-to-r from-brand-50 to-violet-50 border-brand-200 animate-fade-up stagger-1 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-900">Hôm nay có buổi học!</p>
            <p className="text-xs text-brand-600">19:00 – 21:00 · {
              todayDay === 1 ? 'Thứ 2' : todayDay === 3 ? 'Thứ 4' : 'Thứ 6'
            } · Quán cà phê</p>
          </div>
          <Link href="/student/lessons" className="btn-secondary text-xs">
            Xem giáo án <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Progress Overview */}
        <div className="col-span-7 space-y-5">
          {/* Skill Scores */}
          <div className="card p-6 animate-fade-up stagger-2">
            <h2 className="text-sm font-display font-semibold text-ink mb-4">
              Tiến độ 6 kỹ năng — Tháng {studentProfile.currentMonth}
            </h2>
            {rubric ? (
              <div className="grid grid-cols-3 gap-3">
                {SKILL_KEYS.map((k, i) => {
                  const score = rubric[k] ?? 0
                  const pct = (score / 5) * 100
                  const color = score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-brand-500' : score >= 2 ? 'bg-amber-500' : 'bg-red-400'
                  return (
                    <div key={k} className="p-3 rounded-xl bg-surface-secondary">
                      <p className="text-[10px] text-ink-tertiary uppercase tracking-wider mb-2">{SKILL_LABELS[i]}</p>
                      <p className="text-xl font-display font-bold text-ink mb-2">{score > 0 ? score.toFixed(1) : '—'}</p>
                      <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-ink-tertiary">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chưa có điểm tháng này</p>
                <p className="text-xs mt-1">Điểm sẽ được cập nhật sau bài kiểm tra cuối tháng.</p>
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="card p-6 animate-fade-up stagger-3">
            <h2 className="text-sm font-display font-semibold text-ink mb-4">Buổi học gần đây</h2>
            {studentProfile.lessonSessions.length === 0 ? (
              <p className="text-sm text-ink-tertiary text-center py-6">Chưa có buổi học nào được ghi nhận.</p>
            ) : (
              <div className="space-y-2">
                {studentProfile.lessonSessions.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-secondary transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                      ${s.sessionType === 'A' ? 'bg-violet-100 text-violet-700' : s.sessionType === 'B' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {s.sessionType}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{s.lessonPlan?.title ?? `Buổi ${s.sessionType}`}</p>
                      <p className="text-xs text-ink-tertiary">{format(new Date(s.date), "dd/MM/yyyy", { locale: vi })}</p>
                    </div>
                    {s.attended && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="col-span-5 space-y-5">
          {/* Current month topic */}
          <div className="card p-5 animate-fade-up stagger-2">
            <p className="text-[10px] text-ink-tertiary uppercase tracking-wider font-medium mb-3">Đang học — Tháng {studentProfile.currentMonth}</p>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-brand-50 border border-brand-100">
                <p className="text-[10px] text-brand-500 uppercase mb-1">Ngữ pháp</p>
                <p className="text-sm font-medium text-brand-900">{monthData.grammar}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[10px] text-amber-500 uppercase mb-1">Từ vựng</p>
                <p className="text-sm font-medium text-amber-900">{monthData.vocabulary}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-tertiary border border-surface-border">
                <p className="text-[10px] text-ink-tertiary uppercase mb-1">Trọng tâm</p>
                <p className="text-sm font-medium text-ink">{monthData.focus}</p>
              </div>
            </div>
          </div>

          {/* Pending assignments */}
          <div className="card p-5 animate-fade-up stagger-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">Bài tập chưa nộp</p>
              <Link href="/student/assignments" className="text-xs text-brand-500">Xem tất cả</Link>
            </div>
            {studentProfile.assignments.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-ink-tertiary">Không có bài tập chưa nộp 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {studentProfile.assignments.map(sa => (
                  <Link key={sa.assignmentId} href={`/student/assignments/${sa.assignmentId}`}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-surface-secondary transition-colors">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-ink">{sa.assignment.title}</p>
                      {sa.assignment.dueDate && (
                        <p className="text-[10px] text-red-500 mt-0.5">
                          Hạn: {format(new Date(sa.assignment.dueDate), "dd/MM")}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="card p-4 animate-fade-up stagger-4">
            <p className="text-xs text-ink-tertiary uppercase tracking-wider font-medium mb-3">Truy cập nhanh</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/student/vocabulary', label: '📚 Từ vựng' },
                { href: '/student/roadmap', label: '🗺️ Lộ trình' },
                { href: '/student/reports', label: '📊 Báo cáo' },
                { href: '/student/journal', label: '📓 Nhật ký' },
              ].map((item, i) => (
                <Link key={i} href={item.href}
                  className="p-2.5 rounded-xl bg-surface-secondary hover:bg-surface-border border border-surface-border text-xs font-medium text-ink-secondary hover:text-ink transition-all text-center">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
