'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { SkillRadar } from '@/components/ui/SkillRadar'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'
import { QuestionRenderer, type Question } from '@/components/ui/QuestionRenderer'

interface Attempt {
  id: string
  listeningScore: number | null
  readingScore: number | null
  writingScore: number | null
  speakingScore: number | null
  overallBand: number | null
  completedAt: string | null
  test: { title: string }
  answers: Array<{
    id: string
    answer: string
    isCorrect: boolean | null
    aiScore: number | null
    aiFeedback: string | null
    question: { questionType: string; prompt: string; correctAnswer: string }
  }>
}

const SKILL_LABEL = { LISTENING: 'Nghe', READING: 'Đọc', WRITING: 'Viết', SPEAKING: 'Nói' }

export default function MockTestResultPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const attemptId = searchParams.get('attemptId')
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!attemptId) return
    fetch(`/api/attempts/${attemptId}`).then(r => r.json()).then(data => {
      setAttempt(data)
      if (data.overallBand >= 6) setShowConfetti(true)
    })
  }, [attemptId])

  if (!attempt) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  const radarData = [
    { label: 'Nghe', value: attempt.listeningScore ?? 0 },
    { label: 'Đọc', value: attempt.readingScore ?? 0 },
    { label: 'Viết', value: attempt.writingScore ?? 0 },
    { label: 'Nói', value: attempt.speakingScore ?? 0 },
  ]

  const aiFeedbackAnswers = attempt.answers.filter(a => a.aiFeedback)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <ConfettiBurst trigger={showConfetti} />

      <Link href="/student/mock-tests" className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Mock Test
      </Link>

      <div className="page-header animate-fade-up text-center">
        <p className="page-subtitle">{attempt.test.title}</p>
        <h1 className="text-4xl font-display font-bold text-ink mt-2 mb-3">
          Overall: <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-violet-600">{attempt.overallBand?.toFixed(1) ?? '—'}</span>
        </h1>
        <p className="text-sm text-ink-tertiary">Hoàn thành {attempt.completedAt && new Date(attempt.completedAt).toLocaleString('vi')}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 animate-fade-up stagger-1">
        <div className="card p-6 flex items-center justify-center">
          <SkillRadar data={radarData} max={9} size={240} />
        </div>
        <div className="card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-2">Điểm 4 kỹ năng</h2>
          {(['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const).map(skill => {
            const key = `${skill.toLowerCase()}Score` as keyof Attempt
            const score = attempt[key] as number | null
            return (
              <div key={skill} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                <span className="text-sm text-ink">{SKILL_LABEL[skill]}</span>
                <BandPill band={score} size="md" />
              </div>
            )
          })}
        </div>
      </div>

      {aiFeedbackAnswers.length > 0 && (
        <div className="space-y-4 animate-fade-up stagger-2">
          <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">AI Feedback chi tiết</h2>
          {aiFeedbackAnswers.map(ans => {
            const fb = ans.aiFeedback ? JSON.parse(ans.aiFeedback) : null
            if (!fb) return null
            return (
              <div key={ans.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-ink-tertiary uppercase tracking-wider">{ans.question.questionType}</p>
                  <BandPill band={fb.overallBand} />
                </div>
                <p className="text-sm text-ink-secondary mb-3 italic">{ans.question.prompt}</p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {Object.entries(fb).filter(([k]) => !['overallBand', 'summaryFeedback', 'improvementSuggestions'].includes(k)).map(([criterion, value]: any) => (
                    <div key={criterion} className="p-3 bg-surface-secondary rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-ink uppercase tracking-wider">{criterion}</p>
                        <BandPill band={value?.band} size="sm" />
                      </div>
                      <p className="text-[11px] text-ink-secondary leading-relaxed">{value?.justification}</p>
                    </div>
                  ))}
                </div>

                {fb.summaryFeedback && (
                  <div className="p-3 bg-brand-50/40 rounded-lg border border-brand-200 mb-2">
                    <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">Tóm tắt</p>
                    <p className="text-sm text-ink">{fb.summaryFeedback}</p>
                  </div>
                )}
                {fb.improvementSuggestions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Cần cải thiện</p>
                    <ul className="list-disc pl-5 text-sm text-ink-secondary space-y-1">
                      {fb.improvementSuggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Review objective questions */}
      {attempt.answers.filter(a => a.isCorrect != null).length > 0 && (
        <details className="card p-5 mt-6 animate-fade-up stagger-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink-secondary uppercase tracking-wider">
            Xem lại câu khách quan ({attempt.answers.filter(a => a.isCorrect != null).length} câu)
          </summary>
          <div className="mt-4 space-y-3">
            {attempt.answers.filter(a => a.isCorrect != null).map((a, i) => (
              <div key={a.id}>
                <QuestionRenderer
                  question={{ id: a.id, questionNumber: i + 1, ...a.question } as Question}
                  answer={a.answer}
                  onChange={() => {}}
                  showCorrect
                  readOnly
                />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
