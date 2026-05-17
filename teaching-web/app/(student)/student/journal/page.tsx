import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { BookOpen, Star, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const QUARTER_LABEL = ['', 'Quý 1', 'Quý 2', 'Quý 3', 'Quý 4']
const TYPE_ICON: Record<string, typeof BookOpen> = {
  WEEKLY: BookOpen,
  MILESTONE: Star,
  TEACHER_NOTE: MessageCircle,
}
const TYPE_COLOR: Record<string, string> = {
  WEEKLY: 'text-primary',
  MILESTONE: 'text-amber-500',
  TEACHER_NOTE: 'text-emerald-500',
}

export default async function JournalPage() {
  const session = await getServerSession(authOptions)

  const student = await db.student.findFirst({
    where: { userId: session!.user.id },
    include: {
      journalEntries: {
        orderBy: [{ quarter: 'asc' }, { month: 'asc' }, { week: 'asc' }],
      },
      weeklyProgress: {
        orderBy: [{ year: 'asc' }, { week: 'asc' }],
      },
    },
  })

  if (!student) return <div className="p-8 text-center text-sm text-muted-foreground">Chưa có thông tin học viên.</div>

  const byQuarter: Record<number, typeof student.journalEntries> = { 1: [], 2: [], 3: [], 4: [] }
  student.journalEntries.forEach(e => {
    if (byQuarter[e.quarter]) byQuarter[e.quarter].push(e)
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nhật ký tiến bộ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hành trình 12 tháng · Tháng hiện tại: {student.currentMonth}
        </p>
      </header>

      {student.weeklyProgress.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Tổng kết theo tuần
            </h2>
            <div className="space-y-2">
              {student.weeklyProgress.slice(-8).map(w => (
                <div key={w.id} className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">T{w.month} · Tuần {w.week}</span>
                  <div className="flex gap-1 shrink-0">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={i}
                        className={cn('w-2 h-2 rounded-full', i < w.sessionsCompleted ? 'bg-primary' : 'bg-border')}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-emerald-500">+{w.newWords} từ</span>
                  {w.highlights && <span className="text-xs text-muted-foreground truncate">{w.highlights}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(byQuarter).map(([q, entries]) => (
        <section key={q} className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
              Q{q}
            </span>
            {QUARTER_LABEL[parseInt(q)]}
          </h2>

          {entries.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center">
                <p className="text-xs text-muted-foreground">Chưa có ghi chú cho quý này.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-3">
                {entries.map(e => {
                  const Icon = TYPE_ICON[e.entryType] ?? BookOpen
                  const color = TYPE_COLOR[e.entryType] ?? 'text-muted-foreground'
                  return (
                    <div key={e.id} className="relative">
                      <div className="absolute -left-4 top-1 w-4 h-4 rounded-full bg-card flex items-center justify-center border">
                        <Icon className={cn('w-2.5 h-2.5', color)} />
                      </div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">Tuần {e.week} · T{e.month}</span>
                            {e.milestone && <Badge variant="warning">{e.milestone}</Badge>}
                          </div>
                          <p className="text-sm leading-relaxed">{e.content}</p>
                          {e.teacherNote && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground italic">Ghi chú GV: {e.teacherNote}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      ))}

      {student.journalEntries.length === 0 && student.weeklyProgress.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Nhật ký trống. Giáo viên sẽ thêm ghi chú sau mỗi mốc quan trọng.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
