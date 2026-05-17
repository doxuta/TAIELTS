import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Award, Clock, Play, CheckCircle2 } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function StudentMockTestsPage() {
  const session = await getServerSession(authOptions)
  const student = await db.student.findFirst({ where: { userId: session!.user.id } })

  const tests = await db.mockTest.findMany({
    where: { isPublished: true },
    include: {
      parts: { select: { timeMinutes: true, skill: true } },
      attempts: student ? { where: { studentId: student.id }, orderBy: { startedAt: 'desc' }, take: 1 } : false,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mock Test</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Luyện thi format Cambridge · AI chấm Writing/Speaking · Báo cáo band ngay
        </p>
      </header>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Award className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có mock test khả dụng.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tests.map(test => {
            const lastAttempt = (test as any).attempts?.[0]
            const totalTime = test.parts.reduce((sum: number, p: any) => sum + p.timeMinutes, 0)
            const isComplete = lastAttempt?.completedAt

            return (
              <Card key={test.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">{test.testType}</Badge>
                        <BandPill band={test.targetBand} size="sm" label="Mục tiêu" />
                      </div>
                      <h2 className="text-base font-semibold">{test.title}</h2>
                      {test.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{test.description}</p>
                      )}
                    </div>
                    {isComplete && (
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                          Lần làm gần nhất
                        </p>
                        <BandPill band={lastAttempt.overallBand} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {totalTime} phút
                      </span>
                      <span>{test.parts.length} sections</span>
                    </div>
                    <div className="flex gap-2">
                      {isComplete && (
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/student/mock-tests/${test.id}/result?attemptId=${lastAttempt.id}`}>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Xem kết quả
                          </Link>
                        </Button>
                      )}
                      <Button asChild size="sm">
                        <Link href={`/student/mock-tests/${test.id}/take`}>
                          <Play className="w-4 h-4 mr-1" /> {isComplete ? 'Làm lại' : 'Bắt đầu'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
