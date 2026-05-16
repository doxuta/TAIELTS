'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MODULE_SKILLS } from '@/lib/modules'

const INPUT =
  'w-full rounded-lg border border-surface-border bg-surface-primary px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'

export function NewModuleForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const targetBand = fd.get('targetBand')?.toString().trim()
    const week = fd.get('week')?.toString().trim()
    const estimated = fd.get('estimatedMinutes')?.toString().trim()

    const payload = {
      title: fd.get('title'),
      summary: fd.get('summary') || null,
      skill: fd.get('skill') || null,
      cefrLevel: fd.get('cefrLevel') || null,
      targetBand: targetBand ? Number(targetBand) : null,
      week: week ? Number(week) : null,
      estimatedMinutes: estimated ? Number(estimated) : null,
    }

    const res = await fetch('/api/modules', {
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
    router.push(`/builder/modules/${data.id}`)
    router.refresh()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-surface-border bg-surface-primary p-5"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Title" required className="md:col-span-2">
          <input
            name="title"
            required
            className={INPUT}
            placeholder="Present Perfect Foundation"
          />
        </Field>
        <Field label="Summary" className="md:col-span-2">
          <textarea name="summary" rows={2} className={INPUT} placeholder="Mục tiêu module..." />
        </Field>
        <Field label="Skill">
          <select name="skill" defaultValue="" className={INPUT}>
            <option value="">—</option>
            {MODULE_SKILLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="CEFR level">
          <input name="cefrLevel" className={INPUT} placeholder="A2 / B1 / B2..." />
        </Field>
        <Field label="Target band">
          <input
            name="targetBand"
            type="number"
            step="0.5"
            min="0"
            max="9"
            className={INPUT}
          />
        </Field>
        <Field label="Week">
          <input name="week" type="number" min="1" className={INPUT} />
        </Field>
        <Field label="Estimated minutes" className="md:col-span-2">
          <input name="estimatedMinutes" type="number" min="0" className={INPUT} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Create module'}
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
