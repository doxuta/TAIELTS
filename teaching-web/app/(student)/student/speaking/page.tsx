'use client'

import { useState, useEffect } from 'react'
import { Mic, Shuffle, Loader2, Sparkles } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { useToast } from '@/components/ui/Toast'

interface Cue {
  id: string; part: number; topic: string; prompt: string
  bulletPoints?: string | null; followUps?: string | null
  band?: number | null; sampleAnswer?: string | null
}

export default function StudentSpeakingPage() {
  const [cue, setCue] = useState<Cue | null>(null)
  const [part, setPart] = useState<1 | 2 | 3>(2)
  const [transcript, setTranscript] = useState('')
  const [scoring, setScoring] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast, ToastContainer } = useToast()

  const draw = async (p: number = part) => {
    setResult(null)
    setTranscript('')
    const res = await fetch(`/api/speaking-cues?part=${p}&random=1`)
    if (res.ok) setCue(await res.json())
  }

  useEffect(() => { draw(part) }, [part])

  const score = async () => {
    if (transcript.trim().split(/\s+/).length < 15) {
      toast('Transcript quá ngắn (≥15 từ)', 'error')
      return
    }
    setScoring(true)
    setResult(null)
    const res = await fetch('/api/ai/score-speaking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ part, transcript }),
    })
    setScoring(false)
    if (res.ok) {
      setResult(await res.json())
      toast('AI đã chấm xong!', 'success')
    } else {
      const err = await res.json()
      toast(err.error ?? 'Lỗi chấm AI', 'error')
    }
  }

  const bullets = cue?.bulletPoints ? JSON.parse(cue.bulletPoints) as string[] : []
  const followUps = cue?.followUps ? JSON.parse(cue.followUps) as string[] : []

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Luyện Speaking</h1>
        <p className="page-subtitle">Random cue card · AI chấm 4 tiêu chí · Phản hồi tức thì</p>
      </div>

      <div className="flex gap-2 mb-5 animate-fade-up stagger-1">
        {[1, 2, 3].map(p => (
          <button
            key={p}
            onClick={() => setPart(p as 1 | 2 | 3)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${part === p ? 'bg-brand-600 border-brand-600 text-white' : 'bg-surface border-surface-border text-ink-secondary'}`}
          >
            Part {p}
          </button>
        ))}
      </div>

      {cue && (
        <div className="card p-6 mb-5 animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-ink-tertiary uppercase tracking-wider">{cue.topic}</p>
            <button onClick={() => draw()} className="btn-secondary text-xs">
              <Shuffle className="w-3.5 h-3.5" /> Đề khác
            </button>
          </div>
          <p className="text-base font-semibold text-ink mb-4">{cue.prompt}</p>
          {bullets.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-sm text-ink-secondary mb-3">
              {bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
          {followUps.length > 0 && (
            <details className="text-xs">
              <summary className="text-ink-secondary cursor-pointer hover:text-ink">Xem {followUps.length} câu hỏi follow-up</summary>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-ink-secondary">
                {followUps.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </details>
          )}
        </div>
      )}

      <div className="card p-5 mb-5 animate-fade-up stagger-3">
        <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-2">Transcript của bạn</p>
        <textarea
          className="input resize-y text-sm font-mono min-h-[180px]"
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Ghi âm rồi gõ lại / paste lời nói của bạn vào đây..."
          rows={8}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-ink-tertiary tabular-nums">{transcript.trim().split(/\s+/).filter(Boolean).length} từ</p>
          <button onClick={score} disabled={scoring || !transcript} className="btn-primary text-sm">
            {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Chấm AI
          </button>
        </div>
      </div>

      {result && (
        <div className="card p-5 animate-fade-up bg-gradient-to-br from-brand-50/40 to-violet-50/40 border-brand-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Kết quả AI</p>
            <BandPill band={result.overallBand} size="lg" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {['fluency', 'lexical', 'grammar', 'pronunciation'].map(k => (
              <div key={k} className="p-3 bg-surface rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink">{k}</p>
                  <BandPill band={result[k]?.band} size="sm" />
                </div>
                <p className="text-[11px] text-ink-secondary leading-relaxed">{result[k]?.justification}</p>
              </div>
            ))}
          </div>
          {result.summaryFeedback && (
            <div className="p-3 bg-surface rounded-lg mb-2">
              <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Tóm tắt</p>
              <p className="text-sm text-ink">{result.summaryFeedback}</p>
            </div>
          )}
          {result.improvementSuggestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Cần cải thiện</p>
              <ul className="list-disc pl-5 text-sm text-ink-secondary space-y-1">
                {result.improvementSuggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {ToastContainer}
    </div>
  )
}
