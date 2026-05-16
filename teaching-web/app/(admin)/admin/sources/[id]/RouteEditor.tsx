'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTE_TYPES } from '@/lib/sources'

const INPUT =
  'w-full rounded-lg border border-surface-border bg-surface-primary px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'

export function RouteEditor({ sourceId }: { sourceId: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routeType, setRouteType] = useState<string>('URL')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const locatorRaw = fd.get('locator')?.toString().trim()
    let locator: unknown = null
    if (locatorRaw) {
      try {
        locator = JSON.parse(locatorRaw)
      } catch {
        locator = locatorRaw
      }
    }
    const payload = {
      routeType: fd.get('routeType'),
      displayLabel: fd.get('displayLabel'),
      teacherNote: fd.get('teacherNote') || null,
      learnerInstruction: fd.get('learnerInstruction') || null,
      locator,
    }
    const res = await fetch(`/api/sources/${sourceId}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Failed to add route')
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    ;(e.currentTarget as HTMLFormElement).reset()
    setRouteType('URL')
    router.refresh()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border border-dashed border-surface-border bg-surface-secondary p-3"
    >
      <h3 className="text-sm font-semibold text-ink-primary">Add route</h3>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary">
          Route type
          <select
            name="routeType"
            value={routeType}
            onChange={(e) => setRouteType(e.target.value)}
            className={INPUT}
          >
            {ROUTE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary">
          Display label
          <input
            name="displayLabel"
            required
            className={INPUT}
            placeholder="Unit 3 · Exercise 2 / 4:30 / Chương 1"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary md:col-span-2">
          Locator (JSON hoặc text){' '}
          <span className="font-normal text-ink-tertiary">
            ví dụ {'{"page": 42}'} / {'{"seconds": 270}'} / {'{"chapter": 1}'}
          </span>
          <input name="locator" className={INPUT} placeholder='{"seconds": 270}' />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary md:col-span-2">
          Teacher note
          <input name="teacherNote" className={INPUT} placeholder="(chỉ hiện cho teacher/admin)" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary md:col-span-2">
          Learner instruction
          <input
            name="learnerInstruction"
            className={INPUT}
            placeholder="Nghe và viết lại main idea trong 2 câu"
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Add route'}
      </button>
    </form>
  )
}
