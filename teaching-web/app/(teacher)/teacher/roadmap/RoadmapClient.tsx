'use client'

import { useState } from 'react'
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline'

interface Student {
  id: string
  fullName: string
  currentMonth: number
  currentWeek: number
}

export default function RoadmapClient({ students }: { students: Student[] }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? '')

  const active = students.find(s => s.id === selectedId) ?? students[0]

  if (!active) {
    return (
      <div className="card p-16 text-center">
        <p className="text-ink-secondary">Chưa có học viên nào.</p>
      </div>
    )
  }

  return (
    <>
      {/* Student selector — only show when multiple */}
      {students.length > 1 && (
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-ink-secondary">Học viên:</label>
          <select
            className="input w-56 text-sm"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Current progress badge */}
      <div className="flex items-center gap-2 mb-4 text-sm text-ink-secondary">
        <span className="font-medium text-ink">{active.fullName}</span>
        <span>·</span>
        <span>Tháng {active.currentMonth}/12</span>
        <span>·</span>
        <span>Tuần {active.currentWeek}</span>
      </div>

      <RoadmapTimeline currentMonth={active.currentMonth} currentWeek={active.currentWeek} />
    </>
  )
}
