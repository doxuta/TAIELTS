'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VocabCard {
  id: string; word: string; definition?: string | null; example?: string | null
  pronunciation?: string | null; topic?: string | null; dueDate: string
  interval: number; repetitions: number
}

const RATINGS: { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; extra?: string }[] = [
  { label: 'Không nhớ', variant: 'outline', extra: 'border-red-500/40 text-red-500 hover:bg-red-500/10' },
  { label: 'Khó', variant: 'outline' },
  { label: 'Bình thường', variant: 'secondary' },
  { label: 'Dễ', variant: 'default' },
]

export default function VocabPage() {
  const [cards, setCards] = useState<VocabCard[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const load = () => {
    setLoading(true)
    fetch('/api/vocab?due=1')
      .then(r => r.json())
      .then(data => {
        setCards(data)
        setTotal(data.length)
        setIdx(0)
        setFlipped(false)
        setDone(data.length === 0)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const rate = async (rating: number) => {
    const card = cards[idx]
    await fetch('/api/vocab', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id, rating }),
    })
    const next = idx + 1
    if (next >= cards.length) { setDone(true) }
    else { setIdx(next); setFlipped(false) }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  if (done) return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-lg mx-auto">
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">Xong rồi!</h2>
          <p className="text-sm text-muted-foreground mb-6">Bạn đã ôn {total} thẻ từ hôm nay.</p>
          <Button variant="secondary" onClick={load}>
            <RotateCcw className="w-4 h-4 mr-1" /> Xem thêm
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const card = cards[idx]
  if (!card) return null

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-lg mx-auto space-y-5">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Flashcard từ vựng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {idx + 1} / {cards.length} · {card.topic ?? 'Tổng hợp'}
        </p>
      </header>

      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(idx / cards.length) * 100}%` }}
        />
      </div>

      <Card
        className="cursor-pointer min-h-[220px] transition-colors hover:border-primary/40 select-none"
        onClick={() => setFlipped(!flipped)}
      >
        <CardContent className="py-10 flex flex-col items-center justify-center text-center">
          {!flipped ? (
            <>
              <p className="text-3xl font-bold mb-2">{card.word}</p>
              {card.pronunciation && (
                <p className="text-sm text-muted-foreground font-mono">{card.pronunciation}</p>
              )}
              <div className="flex items-center gap-1 mt-6 text-xs text-muted-foreground/70">
                <ChevronDown className="w-3 h-3" /> Nhấn để xem nghĩa
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-primary mb-3">{card.definition}</p>
              {card.example && (
                <p className="text-sm text-muted-foreground italic leading-relaxed">&quot;{card.example}&quot;</p>
              )}
              <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground/70">
                <ChevronUp className="w-3 h-3" /> Nhấn để xem từ
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {flipped && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RATINGS.map((r, i) => (
            <Button
              key={i}
              variant={r.variant}
              size="sm"
              onClick={() => rate(i)}
              className={cn('h-11 text-xs font-semibold', r.extra)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
        <span>Lặp lại: {card.repetitions}×</span>
        <span>Chu kỳ: {card.interval} ngày</span>
      </div>
    </div>
  )
}
