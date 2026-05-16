'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

type ModuleOption = {
  id: string
  title: string
  skill: string | null
  cefrLevel: string | null
}

interface Props {
  studentId: string
  modules: ModuleOption[]
}

const INPUT =
  'w-full rounded-lg border border-surface-border bg-surface-primary px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'

export function AssignModuleAction({ studentId, modules }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [moduleId, setModuleId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!moduleId) {
      setError('Chọn module')
      return
    }
    setError(null)
    setPending(true)
    const res = await fetch(`/api/students/${studentId}/assign-module`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId,
        dueDate: dueDate || null,
        teacherNote: note || null,
      }),
    })
    setPending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Failed')
      return
    }
    setOpen(false)
    setModuleId('')
    setDueDate('')
    setNote('')
    router.refresh()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={modules.length === 0}
        className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        <Plus className="h-3 w-3" /> Assign module
      </button>
    )
  }

  return (
    <div className="w-full rounded-lg border border-dashed border-surface-border bg-surface-secondary p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-primary">Assign module</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-tertiary hover:text-ink-primary"
        >
          Cancel
        </button>
      </div>
      {modules.length === 0 ? (
        <p className="text-xs text-ink-tertiary">
          Không có module published khả dụng. Vào /builder/modules để publish trước.
        </p>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary">
            Module
            <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className={INPUT}>
              <option value="">— chọn module —</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                  {m.skill ? ` · ${m.skill}` : ''}
                  {m.cefrLevel ? ` · ${m.cefrLevel}` : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary">
              Hạn (optional)
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={INPUT}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary">
              Ghi chú cho học viên
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={INPUT}
                placeholder="Optional"
              />
            </label>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {pending ? 'Saving...' : 'Assign'}
          </button>
        </>
      )}
    </div>
  )
}
