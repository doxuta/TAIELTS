import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { BookOpen, Star, MessageCircle } from 'lucide-react'

const QUARTER_LABEL = ['', 'Quý 1', 'Quý 2', 'Quý 3', 'Quý 4']
const TYPE_ICON: Record<string, typeof BookOpen> = {
  WEEKLY: BookOpen,
  MILESTONE: Star,
  TEACHER_NOTE: MessageCircle,
}
const TYPE_COLOR: Record<string, string> = {
  WEEKLY: 'text-brand-500',
  MILESTONE: 'text-amber-500',
  TEACHER_NOTE: 'text-emerald-500',
}

export default async function JournalPage() {
  const session = await getServerSession(authOptions)

  const student = await db.student.findFirst({
    where: { userId: session!.user.id },
    include: {
      journalEntries: {
        orderBy: [{ quarter: 'asc' }, { month: 'asc' }, { week: 'asc' }],
      },
      weeklyProgress: {
        orderBy: [{ year: 'asc' }, { week: 'asc' }],
      },
    },
  })

  if (!student) return <div className="p-8 text-center text-ink-secondary">Chưa có thông tin học viên.</div>

  const byQuarter: Record<number, typeof student.journalEntries> = { 1: [], 2: [], 3: [], 4: [] }
  student.journalEntries.forEach(e => {
    if (byQuarter[e.quarter]) byQuarter[e.quarter].push(e)
  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Nhật ký tiến bộ</h1>
        <p className="page-subtitle">Hành trình 12 tháng · Tháng hiện tại: {student.currentMonth}</p>
      </div>

      {/* Weekly progress summary */}
      {student.weeklyProgress.length > 0 && (
        <div className="card p-5 mb-6 animate-fade-up stagger-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary mb-4">Tổng kết theo tuần</h2>
          <div className="space-y-2">
            {student.weeklyProgress.slice(-8).map(w => (
              <div key={w.id} className="flex items-center gap-4 text-sm">
                <span className="text-xs text-ink-tertiary w-16 flex-shrink-0">T{w.month} · Tuần {w.week}</span>
                <div className="flex gap-1 flex-shrink-0">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < w.sessionsCompleted ? 'bg-brand-500' : 'bg-surface-border'}`} />
                  ))}
                </div>
                <span className="text-xs text-emerald-600">+{w.newWords} từ</span>
                {w.highlights && <span className="text-xs text-ink-secondary truncate">{w.highlights}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal by quarter */}
      {Object.entries(byQuarter).map(([q, entries]) => (
        <div key={q} className="mb-8 animate-fade-up">
          <h2 className="text-sm font-semibold text-ink-secondary mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-surface-tertiary flex items-center justify-center text-xs font-bold text-ink-tertiary">
              Q{q}
            </span>
            {QUARTER_LABEL[parseInt(q)]}
          </h2>

          {entries.length === 0 ? (
            <div className="card p-6 text-center border-dashed">
              <p className="text-xs text-ink-placeholder">Chưa có ghi chú cho quý này.</p>
            </div>
          ) : (
            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-2 top-0 bottom-0 w-px bg-surface-border" />

              <div className="space-y-4">
                {entries.map(e => {
                  const Icon = TYPE_ICON[e.entryType] ?? BookOpen
                  const color = TYPE_COLOR[e.entryType] ?? 'text-ink-tertiary'
                  return (
                    <div key={e.id} className="relative">
                      <div className={`absolute -left-4 top-1 w-4 h-4 rounded-full bg-surface flex items-center justify-center border border-surface-border`}>
                        <Icon className={`w-2.5 h-2.5 ${color}`} />
                      </div>
                      <div className="card p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-ink-tertiary">Tuần {e.week} · T{e.month}</span>
                          {e.milestone && (
                            <span className="badge badge-amber text-xs">{e.milestone}</span>
                          )}
                        </div>
                        <p className="text-sm text-ink leading-relaxed">{e.content}</p>
                        {e.teacherNote && (
                          <div className="mt-2 pt-2 border-t border-surface-border">
                            <p className="text-xs text-ink-secondary italic">Ghi chú GV: {e.teacherNote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ))}

      {student.journalEntries.length === 0 && student.weeklyProgress.length === 0 && (
        <div className="card p-16 text-center animate-fade-up">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Nhật ký trống. Giáo viên sẽ thêm ghi chú sau mỗi mốc quan trọng.</p>
        </div>
      )}
    </div>
  )
}
