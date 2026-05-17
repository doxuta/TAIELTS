'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { ROUTE_TYPES } from '@/lib/sources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SELECT_CLS =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'

export function RouteEditor({ sourceId }: { sourceId: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [routeType, setRouteType] = useState<string>('URL')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
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
      toast.error(data?.error ?? 'Failed to add route')
      setSubmitting(false)
      return
    }
    toast.success('Đã thêm route')
    ;(e.currentTarget as HTMLFormElement).reset()
    setRouteType('URL')
    setSubmitting(false)
    router.refresh()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border border-dashed bg-muted/30 p-4"
    >
      <h3 className="text-sm font-semibold">Add route</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Route type">
          <select
            name="routeType"
            value={routeType}
            onChange={(e) => setRouteType(e.target.value)}
            className={SELECT_CLS}
          >
            {ROUTE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Display label" required>
          <Input
            name="displayLabel"
            required
            placeholder="Unit 3 · Exercise 2 / 4:30 / Chương 1"
          />
        </Field>
        <Field
          label="Locator (JSON / text)"
          hint='Ví dụ {"page": 42} / {"seconds": 270} / {"chapter": 1}'
          className="md:col-span-2"
        >
          <Input name="locator" placeholder='{"seconds": 270}' />
        </Field>
        <Field label="Teacher note" hint="Chỉ hiện cho teacher/admin" className="md:col-span-2">
          <Input name="teacherNote" />
        </Field>
        <Field label="Learner instruction" className="md:col-span-2">
          <Input
            name="learnerInstruction"
            placeholder="Nghe và viết lại main idea trong 2 câu"
          />
        </Field>
      </div>
      <div>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" /> Add route
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {hint && (
          <span className="ml-2 text-[10px] text-muted-foreground font-normal">{hint}</span>
        )}
      </Label>
      {children}
    </div>
  )
}
