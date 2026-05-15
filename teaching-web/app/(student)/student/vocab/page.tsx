'use client'

import { useState, useEffect } from 'react'
import { BookOpen, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

interface VocabCard {
  id: string; word: string; definition?: string | null; example?: string | null
  pronunciation?: string | null; topic?: string | null; dueDate: string
  interval: number; repetitions: number
}

const RATING_LABELS = ['Không nhớ', 'Khó', 'Bình thường', 'Dễ']
const RATING_COLORS = ['btn-secondary border-red-200 text-red-600', 'btn-secondary', 'btn-secondary border-brand-200 text-brand-600', 'btn-primary']

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
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
    </div>
  )

  if (done) return (
    <div className="p-8 max-w-lg mx-auto text-center">
      <div className="card p-12 animate-fade-up">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-display font-semibold text-ink mb-2">Xong rồi!</h2>
        <p className="text-sm text-ink-secondary mb-6">Bạn đã ôn {total} thẻ từ hôm nay.</p>
        <button onClick={load} className="btn-secondary">
          <RotateCcw className="w-4 h-4" /> Xem thêm
        </button>
      </div>
    </div>
  )

  const card = cards[idx]
  if (!card) return null

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Flashcard từ vựng</h1>
        <p className="page-subtitle">{idx + 1} / {cards.length} · {card.topic ?? 'Tổng hợp'}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface-border rounded-full mb-6 animate-fade-up">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${((idx) / cards.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div
        className="card p-8 mb-6 cursor-pointer min-h-[220px] flex flex-col items-center justify-center text-center animate-fade-up stagger-1 select-none"
        onClick={() => setFlipped(!flipped)}
      >
        {!flipped ? (
          <>
            <p className="text-3xl font-display font-bold text-ink mb-2">{card.word}</p>
            {card.pronunciation && (
              <p className="text-sm text-ink-tertiary font-mono">{card.pronunciation}</p>
            )}
            <div className="flex items-center gap-1 mt-6 text-xs text-ink-placeholder">
              <ChevronDown className="w-3 h-3" /> Nhấn để xem nghĩa
            </div>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-brand-600 mb-3">{card.definition}</p>
            {card.example && (
              <p className="text-sm text-ink-secondary italic leading-relaxed">"{card.example}"</p>
            )}
            <div className="flex items-center gap-1 mt-4 text-xs text-ink-placeholder">
              <ChevronUp className="w-3 h-3" /> Nhấn để xem từ
            </div>
          </>
        )}
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2 animate-fade-up">
          {RATING_LABELS.map((label, i) => (
            <button key={i} onClick={() => rate(i)}
              className={`${RATING_COLORS[i]} py-3 text-xs font-semibold rounded-xl border transition-all`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-center gap-6 mt-6 text-xs text-ink-tertiary animate-fade-up stagger-2">
        <span>Lặp lại: {card.repetitions}×</span>
        <span>Chu kỳ: {card.interval} ngày</span>
      </div>
    </div>
  )
}
