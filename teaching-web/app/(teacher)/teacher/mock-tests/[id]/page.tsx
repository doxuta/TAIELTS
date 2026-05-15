import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArrowLeft, Clock, Headphones, BookOpen, Pencil, Mic } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'

const SKILL_LABEL: Record<string, string> = {
  LISTENING: 'Nghe',
  READING: 'Đọc',
  WRITING: 'Viết',
  SPEAKING: 'Nói',
}
const SKILL_ICON: Record<string, any> = {
  LISTENING: Headphones,
  READING: BookOpen,
  WRITING: Pencil,
  SPEAKING: Mic,
}

export default async function MockTestDetailPage({ params }: { params: { id: string } }) {
  const test = await db.mockTest.findUnique({
    where: { id: params.id },
    include: {
      parts: {
        orderBy: [{ skill: 'asc' }, { partNumber: 'asc' }],
        include: { questions: { orderBy: { questionNumber: 'asc' } } },
      },
      attempts: {
        include: { student: { select: { fullName: true } } },
        orderBy: { startedAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!test) notFound()

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/teacher/mock-tests" className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Mock test bank
      </Link>

      <div className="page-header animate-fade-up flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-slate">{test.testType}</span>
            {test.source && <span className="text-xs text-ink-tertiary">{test.source}</span>}
          </div>
          <h1 className="page-title">{test.title}</h1>
          {test.description && <p className="page-subtitle">{test.description}</p>}
        </div>
        <BandPill band={test.targetBand} size="lg" label="Mục tiêu" />
      </div>

      {/* Parts overview */}
      <div className="space-y-4 mb-8">
        {test.parts.map(part => {
          const Icon = SKILL_ICON[part.skill] ?? BookOpen
          return (
            <div key={part.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{SKILL_LABEL[part.skill]} — Part {part.partNumber}</p>
                    <p className="text-xs text-ink-tertiary">{part.questions.length} câu hỏi · {part.title ?? ''}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-ink-tertiary">
                  <Clock className="w-3.5 h-3.5" /> {part.timeMinutes}'
                </div>
              </div>
              {part.passage && (
                <details className="mt-3 text-xs">
                  <summary className="text-ink-secondary cursor-pointer hover:text-ink">Xem passage / transcript</summary>
                  <div className="mt-2 p-3 bg-surface-secondary rounded-lg text-ink-secondary whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {part.passage}
                  </div>
                </details>
              )}
              <details className="mt-2 text-xs">
                <summary className="text-ink-secondary cursor-pointer hover:text-ink">Xem {part.questions.length} câu hỏi</summary>
                <ol className="mt-2 space-y-1.5 pl-4 list-decimal text-ink-secondary">
                  {part.questions.map(q => (
                    <li key={q.id}>
                      <span className="text-[10px] text-ink-tertiary uppercase tracking-wider mr-1">{q.questionType}</span>
                      <span className="text-ink">{q.prompt.slice(0, 100)}{q.prompt.length > 100 ? '...' : ''}</span>
                      <span className="text-emerald-600 ml-2 font-mono">→ {q.correctAnswer}</span>
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          )
        })}
      </div>

      {/* Recent attempts */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-3">10 lượt thi gần nhất</h2>
        {test.attempts.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Chưa có học viên nào làm test này.</p>
        ) : (
          <div className="space-y-2">
            {test.attempts.map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                <div className="text-sm text-ink">{a.student.fullName}</div>
                <div className="flex items-center gap-2">
                  {a.overallBand != null
                    ? <BandPill band={a.overallBand} size="sm" />
                    : <span className="text-xs text-ink-tertiary italic">Đang làm</span>}
                  <span className="text-xs text-ink-tertiary">{new Date(a.startedAt).toLocaleDateString('vi')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
