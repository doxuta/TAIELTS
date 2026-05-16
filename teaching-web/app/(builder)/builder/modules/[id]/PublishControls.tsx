'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  moduleId: string
  status: string
  viewerRole: string
  blockCount: number
}

export function PublishControls({ moduleId, status, viewerRole, blockCount }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function call(path: string) {
    setError(null)
    const res = await fetch(`/api/modules/${moduleId}/${path}`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Action failed')
      return
    }
    startTransition(() => router.refresh())
  }

  const canSubmit = status === 'DRAFT' && blockCount > 0
  const canPublish =
    viewerRole === 'ADMIN' &&
    (status === 'IN_REVIEW' || status === 'DRAFT' || status === 'PUBLISHED') &&
    blockCount > 0
  const canArchive = viewerRole === 'ADMIN' && status !== 'ARCHIVED'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSubmit && (
        <button
          type="button"
          onClick={() => call('submit-review')}
          disabled={pending}
          className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          Submit for review
        </button>
      )}
      {canPublish && (
        <button
          type="button"
          onClick={() => call('publish')}
          disabled={pending}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {status === 'PUBLISHED' ? 'Republish (v+1)' : 'Publish'}
        </button>
      )}
      {canArchive && (
        <button
          type="button"
          onClick={() => call('archive')}
          disabled={pending}
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:bg-surface-tertiary disabled:opacity-50"
        >
          Archive
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
