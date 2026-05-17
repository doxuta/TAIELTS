'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { LICENSE_STATUSES, SOURCE_TYPES, TRUST_LEVELS } from '@/lib/sources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

const SELECT_CLS =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'

export function NewSourceForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
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
      toast.error(data?.error ?? 'Có lỗi xảy ra')
      setSubmitting(false)
      return
    }

    const data = await res.json()
    toast.success('Đã tạo source')
    router.push(`/admin/sources/${data.id}`)
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Type" required>
              <select name="type" required defaultValue="WEB" className={SELECT_CLS}>
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title" required>
              <Input
                name="title"
                required
                placeholder="Cambridge Dictionary — present perfect"
              />
            </Field>
            <Field label="Provider">
              <Input name="provider" placeholder="Cambridge / BBC / Oxford..." />
            </Field>
            <Field label="Author">
              <Input name="author" />
            </Field>
            <Field label="URL" className="md:col-span-2">
              <Input name="url" type="url" placeholder="https://..." />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <Textarea name="description" rows={3} />
            </Field>
            <Field label="Trust level">
              <select name="trustLevel" defaultValue="C_COMMUNITY" className={SELECT_CLS}>
                {TRUST_LEVELS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="License status">
              <select name="licenseStatus" defaultValue="UNKNOWN" className={SELECT_CLS}>
                {LICENSE_STATUSES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="CEFR">
              <Input name="cefrLevel" placeholder="A2 / B1 / B2..." />
            </Field>
            <Field label="Target band">
              <Input
                name="targetBand"
                type="number"
                step={0.5}
                min={0}
                max={9}
              />
            </Field>
            <Field label="Skills (CSV)" className="md:col-span-2">
              <Input name="skills" placeholder="LISTENING,READING,WRITING" />
            </Field>
            <Field label="Topics (CSV)" className="md:col-span-2">
              <Input name="topics" placeholder="grammar,present-perfect" />
            </Field>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Saving...' : 'Create source'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}
