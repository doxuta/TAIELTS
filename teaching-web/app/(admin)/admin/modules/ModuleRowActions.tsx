'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Archive, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Props {
  moduleId: string
  status: string
  blockCount: number
}

export function ModuleRowActions({ moduleId, status, blockCount }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [action, setAction] = useState<string | null>(null)

  const run = (verb: string, path: string, body?: unknown) => {
    setAction(verb)
    fetch(`/api/modules/${moduleId}/${path}`, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
      .then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({ error: 'Failed' }))
          throw new Error(e.error ?? 'Failed')
        }
        toast.success(`Module ${verb}d`)
        startTransition(() => router.refresh())
      })
      .catch((err: Error) => toast.error(err.message))
      .finally(() => setAction(null))
  }

  const canApprove = status === 'IN_REVIEW' && blockCount > 0
  const canReject = status === 'IN_REVIEW'
  const canArchive = status === 'PUBLISHED' || status === 'DRAFT'

  return (
    <div className="flex items-center gap-1">
      {canApprove && (
        <Button
          size="sm"
          variant="default"
          disabled={pending}
          onClick={() => run('approve', 'publish')}
          className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {action === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          <span className="ml-1">Approve</span>
        </Button>
      )}
      {canReject && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            const reason = prompt('Lý do reject? (tùy chọn)')
            if (reason === null) return
            run('reject', 'reject', { reason })
          }}
          className="h-7 px-2"
        >
          {action === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
          <span className="ml-1">Reject</span>
        </Button>
      )}
      {canArchive && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Archive module này?`)) return
            run('archive', 'archive')
          }}
          className="h-7 px-2"
        >
          {action === 'archive' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Archive className="w-3 h-3" />}
          <span className="ml-1">Archive</span>
        </Button>
      )}
    </div>
  )
}
