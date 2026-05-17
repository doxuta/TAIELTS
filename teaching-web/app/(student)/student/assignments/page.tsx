import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import AssignmentSubmit from './AssignmentSubmit'
import { FileText, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TYPE_LABEL: Record<string, string> = {
  WEEKLY_EXERCISE: 'Bài tập tuần',
  MINI_TEST: 'Test mini',
  MONTHLY_TEST: 'Kiểm tra tháng',
}

const TYPE_VARIANT: Record<string, 'default' | 'warning' | 'destructive'> = {
  WEEKLY_EXERCISE: 'default',
  MINI_TEST: 'warning',
  MONTHLY_TEST: 'destructive',
}

export default async function StudentAssignmentsPage() {
  const session = await getServerSession(authOptions)

  const student = await db.student.findFirst({
    where: { userId: session!.user.id },
    include: {
      assignments: {
        include: { assignment: true },
        orderBy: { assignment: { dueDate: 'asc' } },
      },
    },
  })

  if (!student) return <div className="p-8 text-center text-sm text-muted-foreground">Chưa có thông tin học viên.</div>

  const allAssignments = await db.assignment.findMany({
    where: { createdBy: { studentsAsTeacher: { some: { id: student.id } } } },
    include: {
      submissions: { where: { studentId: student.id } },
    },
    orderBy: [{ month: 'desc' }, { week: 'desc' }],
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bài tập & Kiểm tra</h1>
        <p className="text-sm text-muted-foreground mt-1">{allAssignments.length} bài tập từ giáo viên</p>
      </header>

      {allAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có bài tập nào.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allAssignments.map(a => {
            const submission = a.submissions[0]
            const submitted = !!submission?.submittedAt
            const graded = submission?.score != null

            return (
              <Card key={a.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={TYPE_VARIANT[a.type] ?? 'secondary'}>{TYPE_LABEL[a.type]}</Badge>
                        <span className="text-xs text-muted-foreground">T{a.month} · Tuần {a.week}</span>
                        {a.dueDate && (
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />{formatDate(a.dueDate)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                    </div>
                    {graded ? (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Điểm</p>
                        <p className="text-xl font-bold text-primary tabular-nums">{submission!.score}</p>
                      </div>
                    ) : submitted ? (
                      <Badge variant="success" className="shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Đã nộp
                      </Badge>
                    ) : null}
                  </div>

                  {(a.partA || a.partB || a.partC) && (
                    <div className="space-y-2 mb-3">
                      {[['A', a.partA], ['B', a.partB], ['C', a.partC]].filter(([, v]) => v).map(([part, content]) => (
                        <div key={String(part)} className="bg-muted rounded-md p-3 border">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Phần {part}
                          </p>
                          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{content as string}</pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {submission?.feedback && (
                    <div className="bg-primary/5 border border-primary/30 rounded-md p-3 mb-3">
                      <p className="text-xs font-semibold text-primary mb-1">Nhận xét của giáo viên</p>
                      <p className="text-xs leading-relaxed">{submission.feedback}</p>
                    </div>
                  )}

                  {!submitted && <AssignmentSubmit assignmentId={a.id} />}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
