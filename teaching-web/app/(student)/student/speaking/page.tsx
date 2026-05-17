'use client'

import { useState, useEffect } from 'react'
import { Shuffle, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { BandPill } from '@/components/ui/BandPill'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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

  const draw = async (p: number = part) => {
    setResult(null)
    setTranscript('')
    const res = await fetch(`/api/speaking-cues?part=${p}&random=1`)
    if (res.ok) setCue(await res.json())
  }

  useEffect(() => { draw(part) }, [part]) // eslint-disable-line react-hooks/exhaustive-deps

  const score = async () => {
    if (transcript.trim().split(/\s+/).length < 15) {
      toast.error('Transcript quá ngắn (≥15 từ)')
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
      toast.success('AI đã chấm xong!')
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Lỗi chấm AI')
    }
  }

  const bullets = cue?.bulletPoints ? JSON.parse(cue.bulletPoints) as string[] : []
  const followUps = cue?.followUps ? JSON.parse(cue.followUps) as string[] : []

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Luyện Speaking</h1>
        <p className="text-sm text-muted-foreground mt-1">Random cue card · AI chấm 4 tiêu chí · Phản hồi tức thì</p>
      </header>

      <div className="flex gap-2">
        {[1, 2, 3].map(p => (
          <Button
            key={p}
            variant={part === p ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setPart(p as 1 | 2 | 3)}
          >
            Part {p}
          </Button>
        ))}
      </div>

      {cue && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3 gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{cue.topic}</p>
              <Button size="sm" variant="secondary" onClick={() => draw()}>
                <Shuffle className="w-3.5 h-3.5 mr-1" /> Đề khác
              </Button>
            </div>
            <p className="text-base font-semibold mb-4">{cue.prompt}</p>
            {bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mb-3">
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
            {followUps.length > 0 && (
              <details className="text-xs">
                <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                  Xem {followUps.length} câu hỏi follow-up
                </summary>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-muted-foreground">
                  {followUps.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Transcript của bạn
          </p>
          <Textarea
            className="font-mono text-sm min-h-[180px]"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Ghi âm rồi gõ lại / paste lời nói của bạn vào đây..."
            rows={8}
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[10px] text-muted-foreground tabular-nums">
              {transcript.trim().split(/\s+/).filter(Boolean).length} từ
            </p>
            <Button onClick={score} disabled={scoring || !transcript} size="sm">
              {scoring
                ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                : <Sparkles className="w-4 h-4 mr-1" />}
              Chấm AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Kết quả AI</p>
              <BandPill band={result.overallBand} size="lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {['fluency', 'lexical', 'grammar', 'pronunciation'].map(k => (
                <div key={k} className="p-3 bg-card rounded-md border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider">{k}</p>
                    <BandPill band={result[k]?.band} size="sm" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{result[k]?.justification}</p>
                </div>
              ))}
            </div>
            {result.summaryFeedback && (
              <div className="p-3 bg-card rounded-md border mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tóm tắt</p>
                <p className="text-sm">{result.summaryFeedback}</p>
              </div>
            )}
            {result.improvementSuggestions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Cần cải thiện
                </p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {result.improvementSuggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
