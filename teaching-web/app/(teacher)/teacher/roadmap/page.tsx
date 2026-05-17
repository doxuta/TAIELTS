import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import RoadmapClient from './RoadmapClient'

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions)
  const students = await db.student.findMany({
    where: { teacherId: session!.user.id },
    select: { id: true, fullName: true, currentMonth: true, currentWeek: true },
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lộ trình 12 tháng</h1>
        <p className="text-sm text-muted-foreground mt-1">Năm 1 — Nền tảng tiếng Anh</p>
      </header>

      <div className="flex items-center gap-6 flex-wrap">
        {[
          { color: 'bg-emerald-500/20 border-emerald-500/40', label: 'Đã hoàn thành' },
          { color: 'bg-primary/20 border-primary/40 ring-1 ring-primary/30', label: 'Đang học' },
          { color: 'bg-card border opacity-60', label: 'Chưa đến' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${item.color}`} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 md:p-6">
          <RoadmapClient students={students} />
        </CardContent>
      </Card>
    </div>
  )
}
