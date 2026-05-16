'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LICENSE_STATUSES, SOURCE_TYPES, TRUST_LEVELS } from '@/lib/sources'

const INPUT =
  'w-full rounded-lg border border-surface-border bg-surface-primary px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'

export function NewSourceForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const targetBandRaw = fd.get('targetBand')?.toString().trim()
    const payload = {
      type: fd.get('type'),
      title: fd.get('title'),
      provider: fd.get('provider') || null,
      author: fd.get('author') || null,
      url: fd.get('url') || null,
      description: fd.get('description') || null,
      trustLevel: fd.get('trustLevel'),
      licenseStatus: fd.get('licenseStatus'),
      cefrLevel: fd.get('cefrLevel') || null,
      skills: fd.get('skills') || null,
      topics: fd.get('topics') || null,
      targetBand: targetBandRaw ? Number(targetBandRaw) : null,
    }

    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Có lỗi xảy ra')
      setSubmitting(false)
      return
    }

    const data = await res.json()
    router.push(`/admin/sources/${data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-surface-border bg-surface-primary p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Type" required>
          <select name="type" required defaultValue="WEB" className={INPUT}>
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title" required>
          <input name="title" required className={INPUT} placeholder="Cambridge Dictionary — present perfect" />
        </Field>
        <Field label="Provider">
          <input name="provider" className={INPUT} placeholder="Cambridge / BBC / Oxford..." />
        </Field>
        <Field label="Author">
          <input name="author" className={INPUT} />
        </Field>
        <Field label="URL" className="md:col-span-2">
          <input name="url" type="url" className={INPUT} placeholder="https://..." />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <textarea name="description" rows={3} className={INPUT} />
        </Field>
        <Field label="Trust level">
          <select name="trustLevel" defaultValue="C_COMMUNITY" className={INPUT}>
            {TRUST_LEVELS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="License status">
          <select name="licenseStatus" defaultValue="UNKNOWN" className={INPUT}>
            {LICENSE_STATUSES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="CEFR">
          <input name="cefrLevel" className={INPUT} placeholder="A2 / B1 / B2..." />
        </Field>
        <Field label="Target band">
          <input name="targetBand" type="number" step="0.5" min="0" max="9" className={INPUT} />
        </Field>
        <Field label="Skills (CSV)" className="md:col-span-2">
          <input name="skills" className={INPUT} placeholder="LISTENING,READING,WRITING" />
        </Field>
        <Field label="Topics (CSV)" className="md:col-span-2">
          <input name="topics" className={INPUT} placeholder="grammar,present-perfect" />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Create source'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-medium text-ink-secondary ${className ?? ''}`}>
      <span>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}
