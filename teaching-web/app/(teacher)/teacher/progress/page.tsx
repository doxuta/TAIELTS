import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { SKILL_LABELS } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'

export default async function ProgressPage() {
  const session = await getServerSession(authOptions)

  const students = await db.student.findMany({
    where: { teacherId: session!.user.id },
    include: {
      monthlyRubrics: { orderBy: { month: 'asc' } },
      lessonSessions: true,
    },
  })

  const student = students[0]
  const rubrics = student?.monthlyRubrics ?? []

  const SKILLS = ['grammarScore', 'vocabularyScore', 'listeningScore', 'speakingScore', 'readingScore', 'writingScore'] as const
  const LABELS = ['Ngữ pháp', 'Từ vựng', 'Nghe', 'Nói', 'Đọc', 'Viết']

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Theo dõi tiến độ</h1>
        <p className="page-subtitle">Rubric 6 kỹ năng theo tháng · Thang điểm 1–5</p>
      </div>

      {!student ? (
        <div className="card p-16 text-center">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có học viên.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up stagger-1">
          {/* Student selector */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{student.fullName}</p>
              <p className="text-xs text-ink-tertiary">Tháng {student.currentMonth}/12 · {student.lessonSessions.length} buổi học</p>
            </div>
          </div>

          {/* Skills grid */}
          <div className="grid grid-cols-3 gap-4">
            {SKILLS.map((k, i) => {
              const latestRubric = rubrics[rubrics.length - 1]
              const currentScore = latestRubric?.[k] ?? 0
              const prevRubric = rubrics[rubrics.length - 2]
              const prevScore = prevRubric?.[k] ?? 0
              const trend = currentScore - prevScore
              const color = currentScore >= 4 ? 'emerald' : currentScore >= 3 ? 'brand' : currentScore >= 2 ? 'amber' : 'red'

              return (
                <div key={k} className="card p-5">
                  <p className="text-xs text-ink-tertiary uppercase tracking-wider mb-3">{LABELS[i]}</p>
                  <div className="flex items-end gap-3 mb-4">
                    <p className="text-3xl font-display font-bold text-ink">
                      {currentScore > 0 ? currentScore.toFixed(1) : '—'}
                    </p>
                    <p className="text-xs text-ink-tertiary mb-1">/ 5</p>
                    {trend !== 0 && (
                      <p className={`text-xs font-medium mb-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend.toFixed(1)}
                      </p>
                    )}
                  </div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-1 h-12">
                    {rubrics.map((r, j) => {
                      const s = r[k] ?? 0
                      const h = (s / 5) * 100
                      return (
                        <div key={j} className="flex-1 flex flex-col justify-end" title={`T${r.month}: ${s}`}>
                          <div className={`rounded-sm bg-${color}-${j === rubrics.length - 1 ? '500' : '200'} transition-all`}
                            style={{ height: `${Math.max(h, 4)}%` }} />
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    {rubrics.map(r => (
                      <span key={r.month} className="text-[9px] text-ink-placeholder">T{r.month}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Attendance */}
          <div className="card p-6">
            <h2 className="text-sm font-display font-semibold text-ink mb-4">Lịch sử tham gia</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: 52 }, (_, i) => {
                const week = i + 1
                const sessions = student.lessonSessions.filter(s => s.week === week)
                const attended = sessions.filter(s => s.attended).length
                const total = sessions.length
                const opacity = total === 0 ? 0.1 : attended / 3
                return (
                  <div key={i}
                    title={`Tuần ${week}: ${attended}/${Math.max(total, 3)} buổi`}
                    className="w-3 h-3 rounded-sm bg-brand-500 transition-all"
                    style={{ opacity: Math.max(opacity, 0.08) }}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-brand-500 opacity-10" />
                <span className="text-xs text-ink-tertiary">Chưa có</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-brand-500 opacity-50" />
                <span className="text-xs text-ink-tertiary">Một phần</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-brand-500" />
                <span className="text-xs text-ink-tertiary">Đầy đủ</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
