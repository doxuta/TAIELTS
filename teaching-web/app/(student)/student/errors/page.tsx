'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface ErrorEntry {
  id: string; skill: string; category: string
  wrongVersion: string; correctVersion: string
  explanation?: string | null; exampleSentence?: string | null
  source?: string | null; resolved: boolean; createdAt: string
}

export default function StudentErrorsPage() {
  const [entries, setEntries] = useState<ErrorEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')
  const { toast, ToastContainer } = useToast()

  useEffect(() => {
    const q = filter === 'all' ? '' : `?resolved=${filter === 'resolved'}`
    fetch(`/api/errors${q}`).then(r => r.json()).then(setEntries)
  }, [filter])

  const toggleResolved = async (id: string, current: boolean) => {
    const res = await fetch(`/api/errors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: !current }),
    })
    if (res.ok) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, resolved: !current } : e))
      toast(!current ? 'Đã đánh dấu ôn rồi!' : 'Đã bỏ đánh dấu', 'success')
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Sổ tay lỗi sai</h1>
        <p className="page-subtitle">{entries.length} lỗi · Tick khi đã ôn để hoàn thành</p>
      </div>

      <div className="flex gap-2 mb-5 animate-fade-up stagger-1">
        {(['unresolved', 'resolved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-brand-600 text-white' : 'bg-surface-tertiary text-ink-secondary'}`}
          >
            {f === 'all' ? 'Tất cả' : f === 'unresolved' ? 'Cần ôn' : 'Đã ôn'}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="card p-16 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Tuyệt — chưa có lỗi nào trong nhóm này!</p>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-up stagger-2">
          {entries.map(e => (
            <div key={e.id} className={`card p-4 transition-all ${e.resolved ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleResolved(e.id, e.resolved)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${e.resolved ? 'bg-emerald-500 border-emerald-500' : 'border-ink-tertiary hover:border-brand-500'}`}
                >
                  {e.resolved && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs mb-1.5">
                    <span className="badge badge-slate">{e.skill}</span>
                    <span className="text-ink-secondary font-medium">{e.category}</span>
                  </div>
                  <p className="text-sm">
                    <span className="line-through text-red-600 font-mono">{e.wrongVersion}</span>
                    <span className="text-ink-tertiary mx-2">→</span>
                    <span className="text-emerald-700 font-mono font-semibold">{e.correctVersion}</span>
                  </p>
                  {e.explanation && <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">{e.explanation}</p>}
                  {e.exampleSentence && <p className="text-xs text-brand-600 italic mt-1">"{e.exampleSentence}"</p>}
                  {e.source && <p className="text-[10px] text-ink-tertiary mt-1">Nguồn: {e.source}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {ToastContainer}
    </div>
  )
}
