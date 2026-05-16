'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['PENDING_REVIEW', 'APPROVED', 'NEEDS_REWORK', 'OVERRIDDEN'] as const

interface Props {
  feedbackId: string
  currentStatus: string
  currentNotes: string
}

export function ReviewActions({ feedbackId, currentStatus, currentNotes }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState(currentNotes)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function setStatus(next: (typeof STATUSES)[number]) {
    setError(null)
    const res = await fetch(`/api/ai-feedback/${feedbackId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherStatus: next, teacherNotes: notes || null }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Update failed')
      return
    }
    startTransition(() => router.refresh())
  }

  async function saveNotes() {
    setError(null)
    const res = await fetch(`/api/ai-feedback/${feedbackId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherNotes: notes || null }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Save failed')
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <section className="rounded-xl border border-surface-border bg-surface-primary p-4 space-y-3">
      <h2 className="font-semibold text-ink-primary">Teacher review</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
        placeholder="Ghi chú override / điều chỉnh dành cho học viên..."
      />
      <button
        type="button"
        onClick={saveNotes}
        disabled={pending}
        className="rounded-md border border-surface-border bg-surface-secondary px-3 py-1.5 text-xs font-medium hover:bg-surface-tertiary disabled:opacity-50"
      >
        Save notes
      </button>

      <div className="border-t border-surface-border pt-3">
        <p className="text-xs text-ink-tertiary mb-2">
          Trạng thái hiện tại: <span className="font-semibold">{currentStatus}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending || s === currentStatus}
              onClick={() => setStatus(s)}
              className="rounded-md border border-surface-border bg-surface-primary px-3 py-1.5 text-xs font-semibold hover:bg-surface-tertiary disabled:opacity-50"
            >
              {s.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  )
}
