import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import RoadmapClient from './RoadmapClient'

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions)
  const students = await db.student.findMany({
    where: { teacherId: session!.user.id },
    select: { id: true, fullName: true, currentMonth: true, currentWeek: true },
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Lộ trình 12 tháng</h1>
        <p className="page-subtitle">Năm 1 — Nền tảng tiếng Anh</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-8 animate-fade-up stagger-1">
        {[
          { color: 'bg-emerald-100 border-emerald-200', label: 'Đã hoàn thành' },
          { color: 'bg-brand-100 border-brand-200 ring-1 ring-brand-300', label: 'Đang học' },
          { color: 'bg-surface border-surface-border opacity-60', label: 'Chưa đến' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${item.color}`} />
            <span className="text-xs text-ink-secondary">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="card p-6 animate-fade-up stagger-2">
        <RoadmapClient students={students} />
      </div>
    </div>
  )
}
