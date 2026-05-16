'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { reviewLabel, trustLabel } from '@/lib/sources'

type RouteOption = {
  id: string
  routeType: string
  displayLabel: string
}
type SourceOption = {
  id: string
  title: string
  provider: string | null
  trustLevel: string
  reviewStatus: string
  routes: RouteOption[]
}

interface Props {
  attachedToType: string
  attachedToId: string
}

export function CitationAttacher({ attachedToType, attachedToId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sources, setSources] = useState<SourceOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claim, setClaim] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    fetch('/api/sources?reviewStatus=APPROVED')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setSources(Array.isArray(data) ? data : [])
      })
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [open])

  async function attach(sourceRouteId: string) {
    setError(null)
    const res = await fetch('/api/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceRouteId,
        attachedToType,
        attachedToId,
        claim: claim.trim() || null,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Failed to attach')
      return
    }
    setClaim('')
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-primary px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-tertiary"
      >
        <Plus className="h-3 w-3" />
        Attach citation
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-dashed border-surface-border bg-surface-secondary p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-primary">Attach citation</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-tertiary hover:text-ink-primary"
        >
          Cancel
        </button>
      </div>
      <input
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="Claim/note (optional)"
        className="w-full rounded-md border border-surface-border bg-surface-primary px-3 py-1.5 text-sm"
      />
      {loading ? (
        <p className="text-xs text-ink-tertiary">Loading approved sources...</p>
      ) : sources.length === 0 ? (
        <p className="text-xs text-ink-tertiary">
          Chưa có source nào được approve. Vào /admin/sources để approve trước.
        </p>
      ) : (
        <ul className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {sources.map((s) => (
            <li key={s.id} className="rounded-md border border-surface-border bg-surface-primary p-2">
              <div className="text-sm font-medium text-ink-primary">{s.title}</div>
              <div className="text-xs text-ink-tertiary">
                {s.provider ?? '—'} · {trustLabel(s.trustLevel)} · {reviewLabel(s.reviewStatus)}
              </div>
              {s.routes.length === 0 ? (
                <p className="mt-1 text-xs text-ink-tertiary">No routes</p>
              ) : (
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.routes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => attach(r.id)}
                      className="rounded-md bg-brand-50 px-2 py-1 text-xs text-brand-700 hover:bg-brand-100"
                    >
                      + {r.routeType} · {r.displayLabel}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function CitationDetacher({ citationId }: { citationId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function detach() {
    if (!confirm('Gỡ citation này?')) return
    setPending(true)
    const res = await fetch(`/api/citations?id=${citationId}`, { method: 'DELETE' })
    setPending(false)
    if (res.ok) router.refresh()
  }

  return (
    <button
      type="button"
      onClick={detach}
      disabled={pending}
      className="inline-flex items-center gap-1 text-xs text-ink-tertiary hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="h-3 w-3" /> Remove
    </button>
  )
}
