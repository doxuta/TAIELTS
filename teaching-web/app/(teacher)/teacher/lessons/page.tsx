import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, FileText, Clock, BookOpen } from 'lucide-react'

const SESSION_COLORS = {
  A: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  B: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
  C: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

const SESSION_LABELS = {
  A: 'Ngữ pháp & Từ vựng',
  B: 'Nghe & Nói',
  C: 'Đọc & Viết',
}

export default async function LessonsPage() {
  const session = await getServerSession(authOptions)
  const lessons = await db.lessonPlan.findMany({
    where: { createdById: session!.user.id },
    orderBy: [{ month: 'desc' }, { week: 'desc' }, { sessionNumber: 'desc' }],
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Giáo án</h1>
          <p className="page-subtitle">{lessons.length} giáo án đã tạo</p>
        </div>
        <Link href="/teacher/lessons/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Soạn giáo án mới
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="card p-16 text-center animate-fade-up">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <h3 className="text-lg font-display font-semibold text-ink mb-2">Chưa có giáo án</h3>
          <p className="text-sm text-ink-secondary mb-6">Soạn giáo án đầu tiên cho buổi học sắp tới.</p>
          <Link href="/teacher/lessons/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Soạn giáo án mới
          </Link>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up stagger-1">
          {lessons.map((lesson) => {
            const colors = SESSION_COLORS[lesson.sessionType as 'A' | 'B' | 'C']
            const statusColors = {
              DRAFT: 'badge-slate',
              READY: 'badge-brand',
              COMPLETED: 'badge-green',
              CANCELLED: 'badge-red',
            }
            const statusLabels = { DRAFT: 'Nháp', READY: 'Sẵn sàng', COMPLETED: 'Đã dạy', CANCELLED: 'Huỷ' }

            return (
              <Link key={lesson.id} href={`/teacher/lessons/${lesson.id}`}
                className="card p-5 block hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Session type badge */}
                  <div className={`w-10 h-10 rounded-xl border ${colors.bg} ${colors.border} flex items-center justify-center shrink-0`}>
                    <span className={`text-sm font-bold ${colors.text}`}>{lesson.sessionType}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-ink">{lesson.title}</h3>
                      <span className={statusColors[lesson.status as keyof typeof statusColors] || 'badge-slate'}>
                        {statusLabels[lesson.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-ink-tertiary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Tháng {lesson.month} · Tuần {lesson.week} · Buổi {lesson.sessionNumber}
                      </span>
                      <span>{SESSION_LABELS[lesson.sessionType as 'A' | 'B' | 'C']}</span>
                      {lesson.date && <span>{formatDate(lesson.date)}</span>}
                    </div>
                    {lesson.grammarTopic && (
                      <p className="text-xs text-ink-secondary mt-1.5 truncate">📖 {lesson.grammarTopic}</p>
                    )}
                  </div>

                  <FileText className="w-4 h-4 text-ink-placeholder shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
