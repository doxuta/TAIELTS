'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

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
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState(currentRole)

  const isSelf = selfId === userId
  const disabled = pending || (isSelf && value === 'ADMIN') || isLastAdmin

  async function change(next: string) {
    setError(null)
    setValue(next)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: next }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Update failed')
      setValue(currentRole)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-surface-border bg-surface-primary px-2 py-1 text-xs disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {isSelf && <span className="text-[10px] text-ink-tertiary">(yourself)</span>}
      {isLastAdmin && !isSelf && (
        <span className="text-[10px] text-ink-tertiary">last admin</span>
      )}
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
}
