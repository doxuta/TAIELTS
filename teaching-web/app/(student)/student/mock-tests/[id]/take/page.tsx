'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Timer } from '@/components/ui/Timer'
import { QuestionRenderer, type Question } from '@/components/ui/QuestionRenderer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    toast.success('Đã lưu tiến độ')
  }

  const submitTest = async () => {
    if (!attemptId) return
    setSubmitting(true)
    const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }))
    await fetch(`/api/attempts/${attemptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: payload }),
    })
    await fetch(`/api/attempts/${attemptId}/score`, { method: 'POST' })
    setSubmitting(false)
    router.push(`/student/mock-tests/${params.id}/result?attemptId=${attemptId}`)
  }

  if (!test) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b px-4 md:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <p className="text-sm font-semibold truncate">{test.title}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Part {partIdx + 1} / {test.parts.length} · {currentPart && SKILL_LABEL[currentPart.skill]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Timer totalSeconds={totalSeconds} onExpire={submitTest} />
          <Button size="sm" variant="secondary" onClick={saveProgress} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            Lưu
          </Button>
        </div>
      </header>

      <div className="px-4 md:px-6 py-2 bg-muted/40 border-b">
        <div className="flex gap-1.5 overflow-x-auto">
          {test.parts.map((p, i) => (
            <Button
              key={p.id}
              size="sm"
              variant={i === partIdx ? 'default' : 'outline'}
              onClick={() => setPartIdx(i)}
              className="shrink-0 h-7 px-3 text-xs"
            >
              {SKILL_LABEL[p.skill]} · P{p.partNumber}
            </Button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 md:px-6 py-6 max-w-7xl mx-auto w-full">
        {currentPart && (
          <div className={`grid gap-5 ${currentPart.passage ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
            {currentPart.passage && (
              <Card className="max-h-[calc(100vh-200px)] overflow-y-auto lg:sticky lg:top-32">
                <CardContent className="p-5">
                  {currentPart.title && <h2 className="text-base font-bold mb-3">{currentPart.title}</h2>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentPart.passage}</p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {currentPart.instructions && (
                <div className="p-3 rounded-md border border-primary/30 bg-primary/5 text-xs">
                  {currentPart.instructions}
                </div>
              )}
              {currentPart.questions.map(q => (
                <Card key={q.id}>
                  <CardContent className="p-4">
                    <QuestionRenderer
                      question={q}
                      answer={answers[q.id] ?? ''}
                      onChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                    />
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-between pt-4 border-t">
                <Button
                  disabled={partIdx === 0}
                  variant="secondary"
                  onClick={() => setPartIdx(p => p - 1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Part trước
                </Button>
                {partIdx < test.parts.length - 1 ? (
                  <Button onClick={() => setPartIdx(p => p + 1)}>
                    Part tiếp <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={submitTest} disabled={submitting}>
                    {submitting
                      ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    Nộp bài & chấm AI
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
