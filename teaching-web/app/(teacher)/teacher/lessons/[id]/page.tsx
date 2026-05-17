import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle2, FileText, Clock, Calendar, Library } from 'lucide-react'
import { getSessionTypeSummary, formatDate } from '@/lib/utils'
import LessonActions from './LessonActions'
import { CitationList, type CitationWithSource } from '@/components/sources/CitationList'
import { CitationAttacher } from '@/components/sources/CitationAttacher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SESSION_BG: Record<string, string> = {
  A: 'border-violet-500/30 bg-violet-500/5',
  B: 'border-sky-500/30 bg-sky-500/5',
  C: 'border-emerald-500/30 bg-emerald-500/5',
}

const SESSION_PILL: Record<string, string> = {
  A: 'bg-violet-500/15 text-violet-500 border-violet-500/40',
  B: 'bg-sky-500/15 text-sky-500 border-sky-500/40',
  C: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40',
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
  CANCELLED: 'Đã huỷ',
}

export default async function LessonDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const lesson = await db.lessonPlan.findFirst({
    where: { id: params.id, createdById: session!.user.id },
  })

  if (!lesson) notFound()

  const citations = (await db.citation.findMany({
    where: { attachedToType: 'LESSON_PLAN', attachedToId: lesson.id },
    include: { sourceRoute: { include: { source: true } } },
    orderBy: { createdAt: 'asc' },
  })) as unknown as CitationWithSource[]

  const type = lesson.sessionType as 'A' | 'B' | 'C'

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/teacher/lessons">
          <ArrowLeft className="w-3 h-3 mr-1" /> Quay lại danh sách
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn(
              'inline-flex items-center justify-center w-7 h-7 rounded-md border text-sm font-bold',
              SESSION_PILL[type]
            )}>{type}</span>
            <Badge variant={STATUS_VARIANT[lesson.status] ?? 'secondary'}>
              {STATUS_LABEL[lesson.status] ?? lesson.status}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{getSessionTypeSummary(type)}</p>
        </div>
        <LessonActions lessonId={lesson.id} currentStatus={lesson.status} />
      </div>

      <Card className={cn('border', SESSION_BG[type])}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Tháng {lesson.month} · Tuần {lesson.week}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Buổi số {lesson.sessionNumber}
            </div>
            {lesson.date && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> {formatDate(lesson.date)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {(lesson.grammarTopic || lesson.vocabularyFocus || lesson.listeningFocus || lesson.speakingFocus || lesson.readingFocus || lesson.writingFocus) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Chủ đề buổi học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lesson.grammarTopic && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Ngữ pháp</p>
                    <p className="text-sm font-medium">{lesson.grammarTopic}</p>
                  </div>
                )}
                {lesson.vocabularyFocus && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Từ vựng</p>
                    <p className="text-sm font-medium">{lesson.vocabularyFocus}</p>
                  </div>
                )}
                {lesson.listeningFocus && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Listening</p>
                    <p className="text-sm font-medium">{lesson.listeningFocus}</p>
                  </div>
                )}
                {lesson.speakingFocus && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Speaking / Phát âm</p>
                    <p className="text-sm font-medium">{lesson.speakingFocus}</p>
                  </div>
                )}
                {lesson.readingFocus && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Reading</p>
                    <p className="text-sm font-medium">{lesson.readingFocus}</p>
                  </div>
                )}
                {lesson.writingFocus && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Writing</p>
                    <p className="text-sm font-medium">{lesson.writingFocus}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Library className="w-4 h-4" /> Nguồn tham chiếu
            </CardTitle>
            <CitationAttacher attachedToType="LESSON_PLAN" attachedToId={lesson.id} />
          </CardHeader>
          <CardContent>
            <CitationList
              citations={citations}
              viewerRole="TEACHER"
              emptyMessage="Chưa gắn nguồn. Bấm Attach citation để chọn từ kho nguồn đã được duyệt."
            />
          </CardContent>
        </Card>

        {lesson.mainContent && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Nội dung chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{lesson.mainContent}</pre>
            </CardContent>
          </Card>
        )}

        {lesson.homework && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Bài tập về nhà
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{lesson.homework}</pre>
            </CardContent>
          </Card>
        )}

        {lesson.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Ghi chú thêm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{lesson.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
