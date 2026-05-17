'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { REVIEW_STATUSES, reviewLabel, type ReviewStatus } from '@/lib/sources'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const TONE: Record<ReviewStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'> = {
  DRAFT: 'outline',
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  DEPRECATED: 'secondary',
  BLOCKED: 'destructive',
}

export function ReviewControls({
  sourceId,
  currentStatus,
}: {
  sourceId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  async function setStatus(next: ReviewStatus) {
    const res = await fetch(`/api/sources/${sourceId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus: next }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error ?? 'Update failed')
      return
    }
    toast.success(`Trạng thái: ${reviewLabel(next)}`)
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Hiện tại:</span>
        <Badge variant={TONE[currentStatus as ReviewStatus] ?? 'outline'}>
          {reviewLabel(currentStatus)}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {REVIEW_STATUSES.map((status) => {
          const active = status === currentStatus
          const variant = active ? TONE[status] : 'outline'
          return (
            <Button
              key={status}
              type="button"
              variant={variant === 'success' || variant === 'warning' || variant === 'destructive' ? 'default' : variant}
              size="sm"
              disabled={pending || active}
              onClick={() => setStatus(status)}
              className={
                active
                  ? variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : variant === 'warning'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : variant === 'destructive'
                        ? 'bg-destructive hover:bg-destructive/90'
                        : ''
                  : ''
              }
            >
              {pending && <Loader2 className="h-3 w-3 animate-spin" />}
              {reviewLabel(status)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
