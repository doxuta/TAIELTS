'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  BookOpen,
  Pencil,
  Mic,
  Brain,
  ArrowRight,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { GeneratedEntryTest, EntryAnswers, EntryScore } from '@/lib/entry-test'

type Step = 'loading' | 'grammar' | 'reading' | 'writing' | 'speaking' | 'submitting' | 'result'

export default function EntryTestPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('loading')
  const [test, setTest] = useState<GeneratedEntryTest | null>(null)
  const [error, setError] = useState('')
  const [grammarAns, setGrammarAns] = useState<number[]>([])
  const [readingAns, setReadingAns] = useState<number[]>([])
  const [writingText, setWritingText] = useState('')
  const [speakingTranscript, setSpeakingTranscript] = useState('')
  const [result, setResult] = useState<EntryScore | null>(null)

  useEffect(() => {
    fetch('/api/entry-test')
      .then(async (r) => {
        if (r.status === 409) {
          // already done — go to dashboard
          router.push('/student/dashboard')
          return null
        }
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          throw new Error(d.error ?? `HTTP ${r.status}`)
        }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setTest(data.test)
        setGrammarAns(Array(data.test.grammar.length).fill(-1))
        setReadingAns(Array(data.test.reading.questions.length).fill(-1))
        setStep('grammar')
      })
      .catch((e: Error) => {
        setError(e.message)
        setStep('loading')
      })
  }, [router])

  const submit = async () => {
    if (!test) return
    setStep('submitting')
    setError('')
    const payload: { answers: EntryAnswers } = {
      answers: {
        grammar: grammarAns,
        reading: readingAns,
        writingText,
        speakingTranscript,
      },
    }
    const res = await fetch('/api/entry-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Submit failed')
      setStep('writing')
      return
    }
    const data = await res.json()
    setResult(data.score)
    setStep('result')
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        {error ? (
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={() => router.push('/student/dashboard')}>Về Dashboard</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center space-y-3">
            <Brain className="w-12 h-12 mx-auto text-primary animate-pulse" />
            <p className="text-sm text-muted-foreground">
              AI đang tạo bài test phù hợp với trình độ của bạn...
            </p>
          </div>
        )}
      </div>
    )
  }

  if (!test) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500/10 via-background to-emerald-500/10">
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto space-y-5">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary mb-3">
            <Sparkles className="w-3 h-3" /> AI Entry Test — {test.level}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bài kiểm tra đầu vào</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ~20-30 phút · {test.grammar.length} câu ngữ pháp · {test.reading.questions.length} câu đọc hiểu · 1 viết · 1 nói
          </p>
        </header>

        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* Sections */}
        {step === 'grammar' && (
          <SectionMCQ
            title="Phần 1 — Ngữ pháp"
            icon={Brain}
            items={test.grammar}
            answers={grammarAns}
            setAnswers={setGrammarAns}
            onNext={() => setStep('reading')}
          />
        )}

        {step === 'reading' && (
          <ReadingSection
            passage={test.reading.passage}
            items={test.reading.questions}
            answers={readingAns}
            setAnswers={setReadingAns}
            onPrev={() => setStep('grammar')}
            onNext={() => setStep('writing')}
          />
        )}

        {step === 'writing' && (
          <WritingSection
            prompt={test.writing.prompt}
            minWords={test.writing.minWords}
            text={writingText}
            setText={setWritingText}
            onPrev={() => setStep('reading')}
            onNext={() => setStep('speaking')}
          />
        )}

        {step === 'speaking' && (
          <SpeakingSection
            prompt={test.speaking.prompt}
            minSeconds={test.speaking.minSeconds}
            transcript={speakingTranscript}
            setTranscript={setSpeakingTranscript}
            onPrev={() => setStep('writing')}
            onSubmit={submit}
          />
        )}

        {step === 'submitting' && (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
              <p className="text-sm">AI đang chấm bài...</p>
              <p className="text-xs text-muted-foreground">
                Ngữ pháp + đọc auto-score · Viết + nói AI chấm theo rubric IELTS
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'result' && result && <ResultCard result={result} router={router} />}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>
    </div>
  )
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string; icon: typeof BookOpen }[] = [
    { key: 'grammar', label: 'Ngữ pháp', icon: Brain },
    { key: 'reading', label: 'Đọc', icon: BookOpen },
    { key: 'writing', label: 'Viết', icon: Pencil },
    { key: 'speaking', label: 'Nói', icon: Mic },
  ]
  const activeIdx = steps.findIndex((s) => s.key === step)
  return (
    <div className="flex items-center gap-2 justify-center">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              activeIdx === i
                ? 'bg-primary text-primary-foreground border-primary'
                : activeIdx > i
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                : 'bg-muted/50 text-muted-foreground border-border'
            )}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </div>
          {i < steps.length - 1 && <span className="text-muted-foreground/40">→</span>}
        </div>
      ))}
    </div>
  )
}

function SectionMCQ({
  title,
  icon: Icon,
  items,
  answers,
  setAnswers,
  onNext,
  onPrev,
}: {
  title: string
  icon: typeof Brain
  items: { prompt: string; options: string[] }[]
  answers: number[]
  setAnswers: (a: number[]) => void
  onNext: () => void
  onPrev?: () => void
}) {
  const allAnswered = answers.every((a) => a >= 0)
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.map((q, i) => (
          <div key={i}>
            <p className="text-sm font-medium mb-2">
              <span className="text-muted-foreground mr-2">{i + 1}.</span>
              {q.prompt}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, j) => (
                <button
                  key={j}
                  onClick={() =>
                    setAnswers(answers.map((a, idx) => (idx === i ? j : a)))
                  }
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm border transition-colors',
                    answers[i] === j
                      ? 'bg-primary/15 border-primary/50 text-foreground'
                      : 'bg-card hover:bg-accent/30 border-border'
                  )}
                >
                  <span className="text-muted-foreground mr-2 font-mono">
                    {String.fromCharCode(65 + j)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-3 border-t">
          {onPrev ? <Button variant="ghost" onClick={onPrev}>Quay lại</Button> : <div />}
          <Button disabled={!allAnswered} onClick={onNext}>
            Tiếp <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ReadingSection({
  passage,
  items,
  answers,
  setAnswers,
  onPrev,
  onNext,
}: {
  passage: string
  items: { prompt: string; options: string[] }[]
  answers: number[]
  setAnswers: (a: number[]) => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Phần 2 — Đọc hiểu (passage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{passage}</p>
        </CardContent>
      </Card>
      <SectionMCQ
        title="Câu hỏi đọc hiểu"
        icon={BookOpen}
        items={items}
        answers={answers}
        setAnswers={setAnswers}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  )
}

function WritingSection({
  prompt,
  minWords,
  text,
  setText,
  onPrev,
  onNext,
}: {
  prompt: string
  minWords: number
  text: string
  setText: (t: string) => void
  onPrev: () => void
  onNext: () => void
}) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const enough = wordCount >= Math.min(minWords, 20)
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Pencil className="w-4 h-4 text-primary" /> Phần 3 — Viết
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-md bg-primary/5 border border-primary/30 text-sm">
          {prompt}
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Viết bài của bạn ở đây..."
          className="font-mono text-sm"
        />
        <div className="flex items-center justify-between text-xs">
          <span className={cn('tabular-nums', enough ? 'text-emerald-500' : 'text-muted-foreground')}>
            {wordCount} từ {enough && '✓'} (tối thiểu {minWords})
          </span>
          {!enough && (
            <span className="text-muted-foreground">
              AI sẽ không chấm nếu &lt; 20 từ
            </span>
          )}
        </div>
        <div className="flex justify-between pt-3 border-t">
          <Button variant="ghost" onClick={onPrev}>Quay lại</Button>
          <Button onClick={onNext}>
            Tiếp <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SpeakingSection({
  prompt,
  minSeconds,
  transcript,
  setTranscript,
  onPrev,
  onSubmit,
}: {
  prompt: string
  minSeconds: number
  transcript: string
  setTranscript: (t: string) => void
  onPrev: () => void
  onSubmit: () => void
}) {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" /> Phần 4 — Nói
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-md bg-primary/5 border border-primary/30 text-sm">
          {prompt}
        </div>
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-400">
          <strong>Cách làm:</strong> hãy nói ra to (ít nhất {minSeconds} giây) rồi gõ lại / paste lời nói vào ô bên dưới.
          Mobile sẽ ghi âm tự động ở phiên bản sau.
        </div>
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={6}
          placeholder="Gõ lại transcript của bạn ở đây..."
        />
        <p className="text-xs text-muted-foreground tabular-nums">{wordCount} từ</p>
        <div className="flex justify-between pt-3 border-t">
          <Button variant="ghost" onClick={onPrev}>Quay lại</Button>
          <Button onClick={onSubmit}>
            <CheckCircle2 className="w-4 h-4 mr-1" /> Nộp bài & chấm AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultCard({ result, router }: { result: EntryScore; router: ReturnType<typeof useRouter> }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-primary to-violet-600 text-primary-foreground p-6 text-center">
        <Trophy className="w-10 h-10 mx-auto mb-2 opacity-90" />
        <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Kết quả entry test</p>
        <p className="text-5xl font-bold tabular-nums mb-1">
          {result.overallScore.toFixed(1)}<span className="text-xl opacity-70">/20</span>
        </p>
        <p className="text-sm opacity-90">
          AI đề xuất bắt đầu từ <strong>Tháng {result.recommendedMonth}/12</strong>
        </p>
      </div>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Ngữ pháp" value={`${result.grammarScore.toFixed(1)}/20`} />
          <Stat label="Đọc" value={`${result.readingScore.toFixed(1)}/20`} />
          <Stat
            label="Viết"
            value={result.writingScore > 0 ? `Band ${result.writingScore.toFixed(1)}` : '—'}
          />
          <Stat
            label="Nói"
            value={result.speakingScore > 0 ? `Band ${result.speakingScore.toFixed(1)}` : '—'}
          />
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1">
          <p className="font-semibold">Bước tiếp theo</p>
          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
            <li>Lộ trình của bạn đã được set sang Tháng {result.recommendedMonth}</li>
            <li>Mở Today Plan để xem hoạt động đề xuất</li>
            <li>Teacher sẽ liên hệ trong 1-2 ngày làm việc để xếp lớp chính thức</li>
          </ul>
        </div>

        <Button className="w-full" onClick={() => router.push('/student/today')}>
          Bắt đầu Today Plan <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-base font-bold tabular-nums">{value}</p>
    </div>
  )
}
