'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const STATUSES = ['PENDING_REVIEW', 'APPROVED', 'NEEDS_REWORK', 'OVERRIDDEN'] as const

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  NEEDS_REWORK: 'destructive',
  OVERRIDDEN: 'outline',
}

interface Props {
  feedbackId: string
  currentStatus: string
  currentNotes: string
}

export function ReviewActions({ feedbackId, currentStatus, currentNotes }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState(currentNotes)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function setStatus(next: (typeof STATUSES)[number]) {
    setError(null)
    const res = await fetch(`/api/ai-feedback/${feedbackId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherStatus: next, teacherNotes: notes || null }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Update failed')
      return
    }
    startTransition(() => router.refresh())
  }

  async function saveNotes() {
    setError(null)
    const res = await fetch(`/api/ai-feedback/${feedbackId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherNotes: notes || null }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Save failed')
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Teacher review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Ghi chú override / điều chỉnh dành cho học viên..."
        />
        <Button size="sm" variant="secondary" onClick={saveNotes} disabled={pending}>
          <Save className="w-3 h-3 mr-1" /> Save notes
        </Button>

        <Separator />

        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            Trạng thái hiện tại:
            <Badge variant={STATUS_VARIANT[currentStatus] ?? 'secondary'}>
              {currentStatus.replaceAll('_', ' ')}
            </Badge>
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === currentStatus ? 'default' : 'outline'}
                disabled={pending || s === currentStatus}
                onClick={() => setStatus(s)}
              >
                {s.replaceAll('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
