import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Award, Clock, Play, CheckCircle2 } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'

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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Mock Test</h1>
        <p className="page-subtitle">Luyện thi format Cambridge · AI chấm Writing/Speaking · Báo cáo band ngay</p>
      </div>

      {tests.length === 0 ? (
        <div className="card p-16 text-center">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có mock test khả dụng.</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up stagger-1">
          {tests.map(test => {
            const lastAttempt = (test as any).attempts?.[0]
            const totalTime = test.parts.reduce((sum: number, p: any) => sum + p.timeMinutes, 0)
            const isComplete = lastAttempt?.completedAt

            return (
              <div key={test.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-slate text-[10px]">{test.testType}</span>
                      <BandPill band={test.targetBand} size="sm" label="Mục tiêu" />
                    </div>
                    <h2 className="text-base font-semibold text-ink">{test.title}</h2>
                    {test.description && <p className="text-xs text-ink-secondary mt-1 line-clamp-1">{test.description}</p>}
                  </div>
                  {isComplete && (
                    <div className="text-right">
                      <p className="text-[10px] text-ink-tertiary uppercase tracking-wider mb-1">Lần làm gần nhất</p>
                      <BandPill band={lastAttempt.overallBand} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-ink-tertiary">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {totalTime} phút</span>
                    <span>{test.parts.length} sections</span>
                  </div>
                  <div className="flex gap-2">
                    {isComplete && (
                      <Link href={`/student/mock-tests/${test.id}/result?attemptId=${lastAttempt.id}`} className="btn-secondary text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Xem kết quả
                      </Link>
                    )}
                    <Link href={`/student/mock-tests/${test.id}/take`} className="btn-primary text-sm">
                      <Play className="w-4 h-4" /> {isComplete ? 'Làm lại' : 'Bắt đầu'}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
