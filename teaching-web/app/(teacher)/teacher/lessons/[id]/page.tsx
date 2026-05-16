import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle2, FileText, Clock, Calendar, Library } from 'lucide-react'
import { getSessionTypeLabel, getSessionTypeSummary, formatDate } from '@/lib/utils'
import LessonActions from './LessonActions'
import { CitationList, type CitationWithSource } from '@/components/sources/CitationList'
import { CitationAttacher } from '@/components/sources/CitationAttacher'

const SESSION_STYLES = {
  A: { pill: 'session-A', border: 'border-violet-200 bg-violet-50/50' },
  B: { pill: 'session-B', border: 'border-sky-200 bg-sky-50/50' },
  C: { pill: 'session-C', border: 'border-emerald-200 bg-emerald-50/50' },
}

export default async function LessonDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const lesson = await db.lessonPlan.findFirst({
    where: { id: params.id, createdById: session!.user.id },
  })

  if (!lesson) notFound()

  const citations = (await db.citation.findMany({
    where: { attachedToType: 'LESSON_PLAN', attachedToId: lesson.id },
    include: { sourceRoute: { include: { source: true } } },
    orderBy: { createdAt: 'asc' },
  })) as unknown as CitationWithSource[]

  const type = lesson.sessionType as 'A' | 'B' | 'C'
  const style = SESSION_STYLES[type] ?? SESSION_STYLES.A

  const statusLabel: Record<string, string> = {
    DRAFT: 'Nháp',
    READY: 'Sẵn sàng',
    COMPLETED: 'Đã dạy',
    CANCELLED: 'Đã huỷ',
  }
  const statusBadge: Record<string, string> = {
    DRAFT: 'badge-slate',
    READY: 'badge-brand',
    COMPLETED: 'badge-green',
    CANCELLED: 'badge-red',
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up mb-8">
        <Link href="/teacher/lessons" className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={style.pill}>{type}</span>
              <span className={`${statusBadge[lesson.status]} badge`}>{statusLabel[lesson.status]}</span>
            </div>
            <h1 className="page-title">{lesson.title}</h1>
            <p className="page-subtitle mt-1">
              {getSessionTypeSummary(type)}
            </p>
          </div>
          <LessonActions lessonId={lesson.id} currentStatus={lesson.status} />
        </div>
      </div>

      {/* Meta strip */}
      <div className={`card p-4 mb-6 border ${style.border} animate-fade-up stagger-1`}>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-ink-secondary">
            <Calendar className="w-4 h-4" />
            Tháng {lesson.month} · Tuần {lesson.week}
          </div>
          <div className="flex items-center gap-2 text-ink-secondary">
            <Clock className="w-4 h-4" />
            Buổi số {lesson.sessionNumber}
          </div>
          {lesson.date && (
            <div className="flex items-center gap-2 text-ink-secondary">
              <FileText className="w-4 h-4" />
              {formatDate(lesson.date)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Topics */}
        {(lesson.grammarTopic || lesson.vocabularyFocus || lesson.listeningFocus || lesson.speakingFocus || lesson.readingFocus || lesson.writingFocus) && (
          <div className="card p-6 animate-fade-up stagger-1">
            <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-4">Chủ đề buổi học</h2>
            <div className="grid grid-cols-2 gap-3">
              {lesson.grammarTopic && (
                <div>
                  <p className="text-xs text-ink-tertiary mb-0.5">Ngữ pháp</p>
                  <p className="text-sm font-medium text-ink">{lesson.grammarTopic}</p>
                </div>
              )}
              {lesson.vocabularyFocus && (
                <div>
                  <p className="text-xs text-ink-tertiary mb-0.5">Từ vựng</p>
                  <p className="text-sm font-medium text-ink">{lesson.vocabularyFocus}</p>
                </div>
              )}
              {lesson.listeningFocus && (
                <div>
                  <p className="text-xs text-ink-tertiary mb-0.5">Listening</p>
                  <p className="text-sm font-medium text-ink">{lesson.listeningFocus}</p>
                </div>
              )}
              {lesson.speakingFocus && (
                <div>
                  <p className="text-xs text-ink-tertiary mb-0.5">Speaking / Phát âm</p>
                  <p className="text-sm font-medium text-ink">{lesson.speakingFocus}</p>
                </div>
              )}
              {lesson.readingFocus && (
                <div>
                  <p className="text-xs text-ink-tertiary mb-0.5">Reading</p>
                  <p className="text-sm font-medium text-ink">{lesson.readingFocus}</p>
                </div>
              )}
              {lesson.writingFocus && (
                <div>
                  <p className="text-xs text-ink-tertiary mb-0.5">Writing</p>
                  <p className="text-sm font-medium text-ink">{lesson.writingFocus}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Citations */}
        <div className="card p-6 animate-fade-up stagger-2">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-ink-tertiary" />
              <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">
                Nguồn tham chiếu
              </h2>
            </div>
            <CitationAttacher attachedToType="LESSON_PLAN" attachedToId={lesson.id} />
          </div>
          <CitationList
            citations={citations}
            viewerRole="TEACHER"
            emptyMessage="Chưa gắn nguồn. Bấm Attach citation để chọn từ kho nguồn đã được duyệt."
          />
        </div>

        {/* Main content */}
        {lesson.mainContent && (
          <div className="card p-6 animate-fade-up stagger-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-ink-tertiary" />
              <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Nội dung chi tiết</h2>
            </div>
            <pre className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">{lesson.mainContent}</pre>
          </div>
        )}

        {/* Homework */}
        {lesson.homework && (
          <div className="card p-6 border-amber-200 bg-amber-50/30 animate-fade-up stagger-3">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Bài tập về nhà</h2>
            </div>
            <pre className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">{lesson.homework}</pre>
          </div>
        )}

        {/* Notes */}
        {lesson.notes && (
          <div className="card p-6 animate-fade-up stagger-4">
            <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-4">Ghi chú thêm</h2>
            <p className="text-sm text-ink-secondary leading-relaxed">{lesson.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
