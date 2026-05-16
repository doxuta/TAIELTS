'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { REVIEW_STATUSES, reviewLabel, type ReviewStatus } from '@/lib/sources'

const ACTIONS: { status: ReviewStatus; tone: string }[] = [
  { status: 'DRAFT', tone: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { status: 'PENDING_REVIEW', tone: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  { status: 'APPROVED', tone: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
  { status: 'DEPRECATED', tone: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { status: 'BLOCKED', tone: 'bg-red-100 text-red-700 hover:bg-red-200' },
]

export function ReviewControls({
  sourceId,
  currentStatus,
}: {
  sourceId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function setStatus(next: ReviewStatus) {
    setError(null)
    const res = await fetch(`/api/sources/${sourceId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus: next }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Update failed')
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => {
          const active = a.status === currentStatus
          return (
            <button
              key={a.status}
              type="button"
              disabled={pending || active}
              onClick={() => setStatus(a.status)}
              className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${a.tone} ${
                active ? 'ring-2 ring-offset-1 ring-current' : ''
              }`}
            >
              {reviewLabel(a.status)}
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-ink-tertiary">
        Trạng thái hiện tại: <span className="font-semibold">{reviewLabel(currentStatus)}</span>.
        Hành động này được audit log ghi lại.
      </p>
      <p className="text-[11px] text-ink-tertiary">
        ({REVIEW_STATUSES.join(' / ')})
      </p>
    </div>
  )
}
