'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

const NATIVE_SELECT =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'

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
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        disabled={modules.length === 0}
      >
        <Plus className="w-3 h-3 mr-1" /> Assign module
      </Button>
    )
  }

  return (
    <div className="w-full rounded-md border border-dashed bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Assign module</h3>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7 px-2 text-xs">
          Cancel
        </Button>
      </div>
      {modules.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Không có module published khả dụng. Vào /builder/modules để publish trước.
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label>Module</Label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className={NATIVE_SELECT}
            >
              <option value="">— chọn module —</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                  {m.skill ? ` · ${m.skill}` : ''}
                  {m.cefrLevel ? ` · ${m.cefrLevel}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Hạn (optional)</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú cho học viên</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button size="sm" onClick={submit} disabled={pending}>
            {pending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {pending ? 'Saving...' : 'Assign'}
          </Button>
        </>
      )}
    </div>
  )
}
