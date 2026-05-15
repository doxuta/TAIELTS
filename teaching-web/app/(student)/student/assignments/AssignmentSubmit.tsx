'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'

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
      <button onClick={() => setOpen(true)} className="btn-primary w-full text-sm">
        <Send className="w-4 h-4" /> Nộp bài
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        className="input resize-none text-sm font-mono"
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste bài làm của bạn vào đây..."
      />
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="btn-secondary flex-1 text-sm">Huỷ</button>
        <button onClick={submit} disabled={loading || !text.trim()} className="btn-primary flex-1 text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Nộp bài
        </button>
      </div>
    </div>
  )
}
