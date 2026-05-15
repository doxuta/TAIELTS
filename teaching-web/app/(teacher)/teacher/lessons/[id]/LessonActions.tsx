'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Pencil } from 'lucide-react'

export default function LessonActions({ lessonId, currentStatus }: { lessonId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const markCompleted = async () => {
    setLoading(true)
    await fetch(`/api/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {currentStatus !== 'COMPLETED' && (
        <button onClick={markCompleted} disabled={loading} className="btn-primary text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Đánh dấu đã dạy
        </button>
      )}
    </div>
  )
}
