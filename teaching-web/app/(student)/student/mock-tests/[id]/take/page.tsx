'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Save } from 'lucide-react'
import { Timer } from '@/components/ui/Timer'
import { QuestionRenderer, type Question } from '@/components/ui/QuestionRenderer'
import { useToast } from '@/components/ui/Toast'

interface Part {
  id: string
  skill: string
  partNumber: number
  title: string | null
  passage: string | null
  audioUrl: string | null
  timeMinutes: number
  instructions: string | null
  questions: Question[]
}
interface Test {
  id: string
  title: string
  testType: string
  parts: Part[]
}

const SKILL_LABEL: Record<string, string> = { LISTENING: 'Nghe', READING: 'Đọc', WRITING: 'Viết', SPEAKING: 'Nói' }

export default function TakeMockTestPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [partIdx, setPartIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast, ToastContainer } = useToast()

  useEffect(() => {
    Promise.all([
      fetch(`/api/mock-tests/${params.id}`).then(r => r.json()),
      fetch(`/api/mock-tests/${params.id}/attempt`, { method: 'POST' }).then(r => r.json()),
    ]).then(([t, a]) => {
      setTest(t)
      setAttemptId(a.id)
    })
  }, [params.id])

  const totalSeconds = useMemo(() => (test?.parts.reduce((s, p) => s + p.timeMinutes, 0) ?? 60) * 60, [test])
  const currentPart = test?.parts[partIdx]

  const saveProgress = async () => {
    if (!attemptId) return
    setSaving(true)
    const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }))
    await fetch(`/api/attempts/${attemptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: payload }),
    })
    setSaving(false)
    toast('Đã lưu tiến độ', 'success')
  }

  const submitTest = async () => {
    if (!attemptId) return
    setSubmitting(true)
    // Save answers first
    const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }))
    await fetch(`/api/attempts/${attemptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: payload }),
    })
    // Trigger scoring
    await fetch(`/api/attempts/${attemptId}/score`, { method: 'POST' })
    setSubmitting(false)
    router.push(`/student/mock-tests/${params.id}/result?attemptId=${attemptId}`)
  }

  if (!test) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header with timer */}
      <header className="sticky top-0 z-30 bg-surface border-b border-surface-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-ink">{test.title}</p>
          <span className="text-xs text-ink-tertiary">
            Part {partIdx + 1} / {test.parts.length} · {currentPart && SKILL_LABEL[currentPart.skill]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Timer totalSeconds={totalSeconds} onExpire={submitTest} />
          <button onClick={saveProgress} disabled={saving} className="btn-secondary text-xs">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Lưu
          </button>
        </div>
      </header>

      {/* Part nav */}
      <div className="px-6 py-2 bg-surface-secondary border-b border-surface-border">
        <div className="flex gap-1.5 overflow-x-auto">
          {test.parts.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPartIdx(i)}
              className={`shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-all ${i === partIdx ? 'bg-brand-600 text-white' : 'bg-surface text-ink-secondary border border-surface-border hover:bg-surface-tertiary'}`}
            >
              {SKILL_LABEL[p.skill]} · P{p.partNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        {currentPart && (
          <div className={`grid gap-6 ${currentPart.passage ? 'grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
            {currentPart.passage && (
              <div className="card p-6 max-h-[calc(100vh-200px)] overflow-y-auto sticky top-32">
                {currentPart.title && <h2 className="text-base font-bold text-ink mb-3">{currentPart.title}</h2>}
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{currentPart.passage}</p>
              </div>
            )}
            <div className="space-y-4">
              {currentPart.instructions && (
                <div className="p-3 bg-brand-50/40 rounded-lg border border-brand-200 text-xs text-brand-800">
                  {currentPart.instructions}
                </div>
              )}
              {currentPart.questions.map(q => (
                <div key={q.id} className="card p-4">
                  <QuestionRenderer
                    question={q}
                    answer={answers[q.id] ?? ''}
                    onChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                  />
                </div>
              ))}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-surface-border">
                <button
                  disabled={partIdx === 0}
                  onClick={() => setPartIdx(p => p - 1)}
                  className="btn-secondary text-sm disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4" /> Part trước
                </button>
                {partIdx < test.parts.length - 1 ? (
                  <button onClick={() => setPartIdx(p => p + 1)} className="btn-primary text-sm">
                    Part tiếp <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={submitTest} disabled={submitting} className="btn-primary text-sm">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Nộp bài & chấm AI
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {ToastContainer}
    </div>
  )
}
