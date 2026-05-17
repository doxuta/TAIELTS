import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArrowLeft, Clock, Headphones, BookOpen, Pencil, Mic } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const SKILL_LABEL: Record<string, string> = {
  LISTENING: 'Nghe',
  READING: 'Đọc',
  WRITING: 'Viết',
  SPEAKING: 'Nói',
}
const SKILL_ICON: Record<string, any> = {
  LISTENING: Headphones,
  READING: BookOpen,
  WRITING: Pencil,
  SPEAKING: Mic,
}

export default async function MockTestDetailPage({ params }: { params: { id: string } }) {
  const test = await db.mockTest.findUnique({
    where: { id: params.id },
    include: {
      parts: {
        orderBy: [{ skill: 'asc' }, { partNumber: 'asc' }],
        include: { questions: { orderBy: { questionNumber: 'asc' } } },
      },
      attempts: {
        include: { student: { select: { fullName: true } } },
        orderBy: { startedAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!test) notFound()

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/teacher/mock-tests">
          <ArrowLeft className="w-3 h-3 mr-1" /> Mock test bank
        </Link>
      </Button>

      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary">{test.testType}</Badge>
            {test.source && <span className="text-xs text-muted-foreground">{test.source}</span>}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{test.title}</h1>
          {test.description && <p className="text-sm text-muted-foreground mt-1">{test.description}</p>}
        </div>
        <BandPill band={test.targetBand} size="lg" label="Mục tiêu" />
      </header>

      <div className="space-y-3">
        {test.parts.map(part => {
          const Icon = SKILL_ICON[part.skill] ?? BookOpen
          return (
            <Card key={part.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{SKILL_LABEL[part.skill]} — Part {part.partNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {part.questions.length} câu hỏi · {part.title ?? ''}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {part.timeMinutes}&apos;
                  </div>
                </div>
                {part.passage && (
                  <details className="mt-3 text-xs">
                    <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                      Xem passage / transcript
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded-md whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {part.passage}
                    </div>
                  </details>
                )}
                <details className="mt-2 text-xs">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                    Xem {part.questions.length} câu hỏi
                  </summary>
                  <ol className="mt-2 space-y-1.5 pl-4 list-decimal text-muted-foreground">
                    {part.questions.map(q => (
                      <li key={q.id}>
                        <span className="text-[10px] uppercase tracking-wider mr-1">{q.questionType}</span>
                        <span className="text-foreground">{q.prompt.slice(0, 100)}{q.prompt.length > 100 ? '...' : ''}</span>
                        <span className="text-emerald-500 ml-2 font-mono">→ {q.correctAnswer}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            10 lượt thi gần nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          {test.attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có học viên nào làm test này.</p>
          ) : (
            <ul className="divide-y">
              {test.attempts.map(a => (
                <li key={a.id} className="flex items-center justify-between py-2">
                  <div className="text-sm">{a.student.fullName}</div>
                  <div className="flex items-center gap-2">
                    {a.overallBand != null
                      ? <BandPill band={a.overallBand} size="sm" />
                      : <span className="text-xs text-muted-foreground italic">Đang làm</span>}
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.startedAt).toLocaleDateString('vi')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
