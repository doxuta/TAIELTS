'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        <Button onClick={markCompleted} disabled={loading}>
          {loading
            ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            : <CheckCircle2 className="w-4 h-4 mr-1" />}
          Đánh dấu đã dạy
        </Button>
      )}
    </div>
  )
}
