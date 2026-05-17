'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { MODULE_SKILLS } from '@/lib/modules'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

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
    <Card>
      <CardContent className="p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input id="title" name="title" required placeholder="Present Perfect Foundation" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" rows={2} placeholder="Mục tiêu module..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skill">Skill</Label>
              <select
                id="skill"
                name="skill"
                defaultValue=""
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">—</option>
                {MODULE_SKILLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cefrLevel">CEFR level</Label>
              <Input id="cefrLevel" name="cefrLevel" placeholder="A2 / B1 / B2..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetBand">Target band</Label>
              <Input id="targetBand" name="targetBand" type="number" step="0.5" min={0} max={9} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="week">Week</Label>
              <Input id="week" name="week" type="number" min={1} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="estimatedMinutes">Estimated minutes</Label>
              <Input id="estimatedMinutes" name="estimatedMinutes" type="number" min={0} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {submitting ? 'Saving...' : 'Create module'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
