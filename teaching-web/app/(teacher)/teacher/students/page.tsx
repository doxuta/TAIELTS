import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { ArrowRight, Plus, Search } from 'lucide-react'

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)
  const students = await db.student.findMany({
    where: { teacherId: session!.user.id },
    include: {
      user: true,
      monthlyRubrics: { orderBy: { month: 'desc' }, take: 1 },
      lessonSessions: { orderBy: { date: 'desc' }, take: 3 },
    },
    orderBy: { createdAt: 'asc' },
  })

  const SKILL_KEYS = ['grammarScore', 'vocabularyScore', 'listeningScore', 'speakingScore', 'readingScore', 'writingScore'] as const
  const SKILL_LABELS = ['Ngữ pháp', 'Từ vựng', 'Nghe', 'Nói', 'Đọc', 'Viết']

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="page-header flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Học viên</h1>
          <p className="page-subtitle">{students.length} học viên · Tối đa 10</p>
        </div>
        <Link href="/teacher/students/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Thêm học viên
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="card p-16 text-center animate-fade-up">
          <p className="text-5xl mb-4">🎓</p>
          <h3 className="text-lg font-display font-semibold text-ink mb-2">Chưa có học viên</h3>
          <p className="text-sm text-ink-secondary mb-6">Thêm học viên đầu tiên để bắt đầu quản lý lộ trình.</p>
          <Link href="/teacher/students/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Thêm học viên
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 animate-fade-up stagger-1">
          {students.map((student, i) => {
            const rubric = student.monthlyRubrics[0]
            const scores = rubric ? SKILL_KEYS.map(k => rubric[k] ?? 0) : []
            const avgScore = scores.length ? scores.filter(s => s > 0).reduce((a, b) => a + b, 0) / scores.filter(s => s > 0).length : null
            const attendance = student.lessonSessions.length

            return (
              <Link key={student.id} href={`/teacher/students/${student.id}`}
                className="card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer block"
              >
                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {student.fullName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-display font-semibold text-ink">{student.fullName}</h3>
                      <span className="badge-brand">Tháng {student.currentMonth}/12</span>
                      <span className="badge-slate">Tuần {student.currentWeek}</span>
                    </div>
                    <p className="text-sm text-ink-secondary mb-3">{student.occupation} · {student.user.email}</p>

                    {/* Skill scores */}
                    {rubric && (
                      <div className="flex items-center gap-4">
                        {SKILL_KEYS.map((k, j) => {
                          const s = rubric[k] ?? 0
                          const color = s >= 4 ? 'text-emerald-600' : s >= 3 ? 'text-brand-600' : s >= 2 ? 'text-amber-600' : 'text-ink-tertiary'
                          return (
                            <div key={k} className="text-center">
                              <p className={`text-sm font-semibold ${color}`}>{s > 0 ? s.toFixed(1) : '—'}</p>
                              <p className="text-[10px] text-ink-tertiary">{SKILL_LABELS[j]}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {!rubric && (
                      <p className="text-xs text-ink-placeholder">Chưa có dữ liệu rubric · Điền sau bài kiểm tra tháng đầu</p>
                    )}
                  </div>

                  {/* Right */}
                  <div className="text-right shrink-0">
                    {avgScore ? (
                      <div className="mb-2">
                        <p className="text-xl font-display font-bold text-ink">{avgScore.toFixed(1)}</p>
                        <p className="text-[10px] text-ink-tertiary">điểm TB / 5</p>
                      </div>
                    ) : null}
                    <ArrowRight className="w-4 h-4 text-ink-placeholder ml-auto" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
