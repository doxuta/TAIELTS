'use client'

import { useState } from 'react'
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Chưa có học viên nào.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {students.length > 1 && (
        <div className="flex items-center gap-3 mb-5">
          <Label className="text-sm text-muted-foreground">Học viên:</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Chọn học viên" />
            </SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground flex-wrap">
        <span className="font-medium text-foreground">{active.fullName}</span>
        <span>·</span>
        <span>Tháng {active.currentMonth}/12</span>
        <span>·</span>
        <span>Tuần {active.currentWeek}</span>
      </div>

      <RoadmapTimeline currentMonth={active.currentMonth} currentWeek={active.currentWeek} />
    </>
  )
}
