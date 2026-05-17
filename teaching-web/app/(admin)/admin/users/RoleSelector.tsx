'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT'] as const

interface Props {
  userId: string
  currentRole: string
  selfId?: string
  isLastAdmin?: boolean
}

export function RoleSelector({ userId, currentRole, selfId, isLastAdmin }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(currentRole)

  const isSelf = selfId === userId
  const disabled = pending || (isSelf && value === 'ADMIN') || isLastAdmin

  async function change(next: string) {
    const prev = value
    setValue(next)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: next }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setValue(prev)
      toast.error(data?.error ?? 'Update failed')
      return
    }
    toast.success(`Đổi role thành ${next}`)
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-1">
      <Select value={value} onValueChange={change} disabled={disabled}>
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r} className="text-xs">
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isSelf && <span className="text-[10px] text-muted-foreground">(yourself)</span>}
      {isLastAdmin && !isSelf && (
        <span className="text-[10px] text-muted-foreground">last admin</span>
      )}
    </div>
  )
}
