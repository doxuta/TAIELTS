import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getSessionTypeLabel, formatDate } from '@/lib/utils'
import { BookOpen, CheckCircle2, Clock } from 'lucide-react'

const SESSION_PILL: Record<string, string> = { A: 'session-A', B: 'session-B', C: 'session-C' }

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
    return <div className="p-8 text-center text-ink-secondary">Chưa có thông tin học viên.</div>
  }

  const upcoming = student.lessonSessions.filter(s => !s.attended && !s.homeworkDone)
  const past = student.lessonSessions.filter(s => s.attended)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Buổi học & Bài tập</h1>
        <p className="page-subtitle">{past.length} buổi đã học · Tháng {student.currentMonth}/12</p>
      </div>

      {/* Pending homework */}
      {upcoming.length > 0 && (
        <div className="mb-6 animate-fade-up stagger-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-3">
            Bài tập chưa nộp ({upcoming.length})
          </h2>
          <div className="space-y-2">
            {upcoming.map(s => (
              <div key={s.id} className="card p-4 border-amber-200 bg-amber-50/30 flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${SESSION_PILL[s.sessionType]} session-${s.sessionType}`}>Buổi {s.sessionType}</span>
                    <span className="text-xs text-ink-tertiary">{formatDate(s.date)}</span>
                  </div>
                  {s.homework && (
                    <pre className="text-xs text-ink-secondary whitespace-pre-wrap font-sans leading-relaxed">{s.homework}</pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      <div className="animate-fade-up stagger-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary mb-3">Lịch sử buổi học</h2>
        {past.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30 text-ink-tertiary" />
            <p className="text-sm text-ink-secondary">Chưa có buổi học nào được ghi nhận.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {past.map(s => (
              <div key={s.id} className="card p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`session-${s.sessionType}`}>{getSessionTypeLabel(s.sessionType as 'A'|'B'|'C').split('—')[0].trim()}</span>
                      <span className="text-xs text-ink-tertiary">{formatDate(s.date)}</span>
                    </div>
                    {s.lessonPlan && (
                      <p className="text-sm text-ink font-medium">{s.lessonPlan.title}</p>
                    )}
                    {s.homework && (
                      <p className="text-xs text-ink-secondary mt-1 line-clamp-2">{s.homework}</p>
                    )}
                  </div>
                </div>
                {s.quality && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-ink-tertiary">Chất lượng</p>
                    <p className="text-base font-bold text-brand-600">{s.quality}/5</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
