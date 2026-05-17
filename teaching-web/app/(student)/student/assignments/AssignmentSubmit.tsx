'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function AssignmentSubmit({ assignmentId }: { assignmentId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    await fetch(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionText: text }),
    })
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full" size="sm">
        <Send className="w-4 h-4 mr-1" /> Nộp bài
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      <Textarea
        className="font-mono text-sm"
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste bài làm của bạn vào đây..."
      />
      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" size="sm" onClick={() => setOpen(false)}>Huỷ</Button>
        <Button className="flex-1" size="sm" onClick={submit} disabled={loading || !text.trim()}>
          {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
          Nộp bài
        </Button>
      </div>
    </div>
  )
}
