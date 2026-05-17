import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, FileText, Clock, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const SESSION_COLORS = {
  A: 'bg-violet-500/10 border-violet-500/30 text-violet-500',
  B: 'bg-sky-500/10 border-sky-500/30 text-sky-500',
  C: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
}

const SESSION_LABELS = {
  A: 'Ngữ pháp & Từ vựng',
  B: 'Nghe & Nói',
  C: 'Đọc & Viết',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  READY: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nháp',
  READY: 'Sẵn sàng',
  COMPLETED: 'Đã dạy',
  CANCELLED: 'Huỷ',
}

export default async function LessonsPage() {
  const session = await getServerSession(authOptions)
  const lessons = await db.lessonPlan.findMany({
    where: { createdById: session!.user.id },
    orderBy: [{ month: 'desc' }, { week: 'desc' }, { sessionNumber: 'desc' }],
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Giáo án</h1>
          <p className="text-sm text-muted-foreground mt-1">{lessons.length} giáo án đã tạo</p>
        </div>
        <Button asChild>
          <Link href="/teacher/lessons/new">
            <Plus className="w-4 h-4 mr-1" /> Soạn giáo án mới
          </Link>
        </Button>
      </header>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold mb-2">Chưa có giáo án</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Soạn giáo án đầu tiên cho buổi học sắp tới.
            </p>
            <Button asChild>
              <Link href="/teacher/lessons/new">
                <Plus className="w-4 h-4 mr-1" /> Soạn giáo án mới
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const sessionClass = SESSION_COLORS[lesson.sessionType as 'A' | 'B' | 'C']

            return (
              <Card key={lesson.id} className="transition-colors hover:border-primary/50">
                <CardContent className="p-4">
                  <Link href={`/teacher/lessons/${lesson.id}`} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${sessionClass}`}>
                      <span className="text-sm font-bold">{lesson.sessionType}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold">{lesson.title}</h3>
                        <Badge variant={STATUS_VARIANT[lesson.status] ?? 'secondary'}>
                          {STATUS_LABEL[lesson.status] ?? lesson.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Tháng {lesson.month} · Tuần {lesson.week} · Buổi {lesson.sessionNumber}
                        </span>
                        <span>{SESSION_LABELS[lesson.sessionType as 'A' | 'B' | 'C']}</span>
                        {lesson.date && <span>{formatDate(lesson.date)}</span>}
                      </div>
                      {lesson.grammarTopic && (
                        <p className="text-xs text-muted-foreground mt-1.5 truncate">📖 {lesson.grammarTopic}</p>
                      )}
                    </div>

                    <FileText className="w-4 h-4 text-muted-foreground/50 shrink-0" />
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
