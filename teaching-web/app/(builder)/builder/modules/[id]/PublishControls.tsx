'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send, CheckCircle, Archive, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  moduleId: string
  status: string
  viewerRole: string
  blockCount: number
}

export function PublishControls({ moduleId, status, viewerRole, blockCount }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)

  async function call(path: string, verb: string) {
    setError(null)
    setAction(verb)
    const res = await fetch(`/api/modules/${moduleId}/${path}`, { method: 'POST' })
    setAction(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Action failed')
      return
    }
    startTransition(() => router.refresh())
  }

  const canSubmit = status === 'DRAFT' && blockCount > 0
  const canPublish =
    viewerRole === 'ADMIN' &&
    (status === 'IN_REVIEW' || status === 'DRAFT' || status === 'PUBLISHED') &&
    blockCount > 0
  const canArchive = viewerRole === 'ADMIN' && status !== 'ARCHIVED'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSubmit && (
        <Button
          size="sm"
          variant="default"
          onClick={() => call('submit-review', 'submit')}
          disabled={pending}
          className="bg-amber-500 hover:bg-amber-600"
        >
          {action === 'submit' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
          Submit for review
        </Button>
      )}
      {canPublish && (
        <Button
          size="sm"
          onClick={() => call('publish', 'publish')}
          disabled={pending}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {action === 'publish' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
          {status === 'PUBLISHED' ? 'Republish (v+1)' : 'Publish'}
        </Button>
      )}
      {canArchive && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => call('archive', 'archive')}
          disabled={pending}
        >
          {action === 'archive' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Archive className="w-3 h-3 mr-1" />}
          Archive
        </Button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
