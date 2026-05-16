'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Clock, Loader2, Library } from 'lucide-react'
import { blockTypeLabel, parseBlockContent } from '@/lib/modules'
import { CitationList, type CitationWithSource } from '@/components/sources/CitationList'

type Item = {
  blockId: string
  blockTitle: string
  blockType: string
  estimatedMinutes: number | null
  moduleId: string
  moduleTitle: string
  assignmentId: string
  order: number
  progressId: string | null
  status: string
  contentJson: string | null
}

type Payload = { items: Item[]; citations: CitationWithSource[] }

export function TodayPlan() {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/today')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d?.error) {
          setError(d.error)
        } else {
          setData(d)
        }
      })
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  async function mark(blockId: string, status: 'COMPLETED' | 'IN_PROGRESS') {
    setPendingId(blockId)
    const res = await fetch(`/api/today/items/${blockId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setPendingId(null)
    if (res.ok) {
      // Refetch
      const fresh = await fetch('/api/today').then((r) => r.json())
      setData(fresh)
    }
  }

  if (loading) {
    return (
      <div className="card p-6 flex items-center gap-2 text-sm text-ink-tertiary">
        <Loader2 className="w-4 h-4 animate-spin" /> Đang nạp Today Plan...
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 text-sm text-red-600">{error}</div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="card p-6 text-sm text-ink-tertiary">
        Chưa có module nào được giao. Liên hệ giáo viên để được gán lộ trình.
      </div>
    )
  }

  const citationsByBlock = new Map<string, CitationWithSource[]>()
  for (const c of data.citations) {
    const id = c.attachedToId as string | undefined
    if (!id) continue
    const list = citationsByBlock.get(id) ?? []
    list.push(c)
    citationsByBlock.set(id, list)
  }

  return (
    <ol className="space-y-3">
      {data.items.map((item, idx) => {
        const content = parseBlockContent(item.contentJson)
        const done = item.status === 'COMPLETED'
        return (
          <li
            key={item.blockId}
            className="card p-4"
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => mark(item.blockId, done ? 'IN_PROGRESS' : 'COMPLETED')}
                disabled={pendingId === item.blockId}
                className="mt-0.5 shrink-0 text-emerald-600 disabled:opacity-50"
                aria-label={done ? 'Mark not done' : 'Mark complete'}
              >
                {done ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5 text-ink-tertiary hover:text-emerald-600" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {idx + 1}. {blockTypeLabel(item.blockType)}
                  </span>
                  <h3
                    className={`font-semibold ${done ? 'text-ink-tertiary line-through' : 'text-ink-primary'}`}
                  >
                    {item.blockTitle}
                  </h3>
                  {item.estimatedMinutes != null && (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-tertiary">
                      <Clock className="w-3 h-3" /> {item.estimatedMinutes}m
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-tertiary mt-0.5">Module: {item.moduleTitle}</p>
                {content.body && (
                  <div
                    className={`mt-2 rounded-md bg-surface-secondary p-3 text-sm whitespace-pre-wrap ${
                      done ? 'text-ink-tertiary' : 'text-ink-primary'
                    }`}
                  >
                    {content.body}
                  </div>
                )}
                {(citationsByBlock.get(item.blockId) ?? []).length > 0 && (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
                      <Library className="w-3 h-3" /> Nguồn
                    </div>
                    <CitationList
                      citations={citationsByBlock.get(item.blockId) ?? []}
                      viewerRole="STUDENT"
                    />
                  </div>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
