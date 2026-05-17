import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)
  const students = await db.student.findMany({
    where: { teacherId: session!.user.id },
    include: {
      user: true,
      monthlyRubrics: { orderBy: { month: 'desc' }, take: 1 },
      lessonSessions: { orderBy: { date: 'desc' }, take: 3 },
    },
    orderBy: { createdAt: 'asc' },
  })

  const SKILL_KEYS = ['grammarScore', 'vocabularyScore', 'listeningScore', 'speakingScore', 'readingScore', 'writingScore'] as const
  const SKILL_LABELS = ['Ngữ pháp', 'Từ vựng', 'Nghe', 'Nói', 'Đọc', 'Viết']

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Học viên</h1>
          <p className="text-sm text-muted-foreground mt-1">{students.length} học viên · Tối đa 10</p>
        </div>
        <Button asChild>
          <Link href="/teacher/students/new">
            <Plus className="w-4 h-4 mr-1" /> Thêm học viên
          </Link>
        </Button>
      </header>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-5xl mb-4">🎓</p>
            <h3 className="text-lg font-semibold mb-2">Chưa có học viên</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Thêm học viên đầu tiên để bắt đầu quản lý lộ trình.
            </p>
            <Button asChild>
              <Link href="/teacher/students/new">
                <Plus className="w-4 h-4 mr-1" /> Thêm học viên
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {students.map((student) => {
            const rubric = student.monthlyRubrics[0]
            const scores = rubric ? SKILL_KEYS.map(k => rubric[k] ?? 0) : []
            const positives = scores.filter(s => s > 0)
            const avgScore = positives.length ? positives.reduce((a, b) => a + b, 0) / positives.length : null

            return (
              <Card key={student.id} className="transition-colors hover:border-primary/50">
                <CardContent className="p-5">
                  <Link href={`/teacher/students/${student.id}`} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                      {student.fullName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold">{student.fullName}</h3>
                        <Badge>Tháng {student.currentMonth}/12</Badge>
                        <Badge variant="secondary">Tuần {student.currentWeek}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 truncate">
                        {student.occupation} · {student.user.email}
                      </p>

                      {rubric ? (
                        <div className="flex flex-wrap items-center gap-4">
                          {SKILL_KEYS.map((k, j) => {
                            const s = rubric[k] ?? 0
                            const color =
                              s >= 4 ? 'text-emerald-500'
                              : s >= 3 ? 'text-primary'
                              : s >= 2 ? 'text-amber-500'
                              : 'text-muted-foreground'
                            return (
                              <div key={k} className="text-center">
                                <p className={cn('text-sm font-semibold tabular-nums', color)}>
                                  {s > 0 ? s.toFixed(1) : '—'}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{SKILL_LABELS[j]}</p>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/70">
                          Chưa có dữ liệu rubric · Điền sau bài kiểm tra tháng đầu
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {avgScore != null && (
                        <div className="mb-2">
                          <p className="text-xl font-bold tabular-nums">{avgScore.toFixed(1)}</p>
                          <p className="text-[10px] text-muted-foreground">điểm TB / 5</p>
                        </div>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50 ml-auto group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
