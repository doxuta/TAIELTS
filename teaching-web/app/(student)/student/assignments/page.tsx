import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import AssignmentSubmit from './AssignmentSubmit'
import { FileText, CheckCircle2, Clock } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  WEEKLY_EXERCISE: 'Bài tập tuần',
  MINI_TEST: 'Test mini',
  MONTHLY_TEST: 'Kiểm tra tháng',
}
const TYPE_BADGE: Record<string, string> = {
  WEEKLY_EXERCISE: 'badge-brand',
  MINI_TEST: 'badge-amber',
  MONTHLY_TEST: 'badge-red',
}

export default async function StudentAssignmentsPage() {
  const session = await getServerSession(authOptions)

  const student = await db.student.findFirst({
    where: { userId: session!.user.id },
    include: {
      assignments: {
        include: {
          assignment: true,
        },
        orderBy: { assignment: { dueDate: 'asc' } },
      },
    },
  })

  if (!student) return <div className="p-8 text-center text-ink-secondary">Chưa có thông tin học viên.</div>

  // Get all assignments assigned via teacher (same teacherId)
  const allAssignments = await db.assignment.findMany({
    where: { createdBy: { studentsAsTeacher: { some: { id: student.id } } } },
    include: {
      submissions: { where: { studentId: student.id } },
    },
    orderBy: [{ month: 'desc' }, { week: 'desc' }],
  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Bài tập & Kiểm tra</h1>
        <p className="page-subtitle">{allAssignments.length} bài tập từ giáo viên</p>
      </div>

      {allAssignments.length === 0 ? (
        <div className="card p-16 text-center animate-fade-up">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-ink-tertiary" />
          <p className="text-ink-secondary">Chưa có bài tập nào.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up stagger-1">
          {allAssignments.map(a => {
            const submission = a.submissions[0]
            const submitted = !!submission?.submittedAt
            const graded = submission?.score != null

            return (
              <div key={a.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${TYPE_BADGE[a.type]} badge`}>{TYPE_LABEL[a.type]}</span>
                      <span className="text-xs text-ink-tertiary">T{a.month} · Tuần {a.week}</span>
                      {a.dueDate && (
                        <span className="text-xs text-ink-tertiary flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatDate(a.dueDate)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-ink">{a.title}</h3>
                  </div>
                  {graded ? (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-ink-tertiary">Điểm</p>
                      <p className="text-xl font-bold text-brand-600">{submission!.score}</p>
                    </div>
                  ) : submitted ? (
                    <span className="badge badge-green flex-shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đã nộp
                    </span>
                  ) : null}
                </div>

                {/* Assignment content */}
                {(a.partA || a.partB || a.partC) && (
                  <div className="space-y-3 mb-4">
                    {[['A', a.partA], ['B', a.partB], ['C', a.partC]].filter(([, v]) => v).map(([part, content]) => (
                      <div key={part} className="bg-surface-secondary rounded-xl p-3 border border-surface-border">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary mb-1.5">Phần {part}</p>
                        <pre className="text-xs text-ink-secondary whitespace-pre-wrap font-sans leading-relaxed">{content as string}</pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feedback */}
                {submission?.feedback && (
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-3">
                    <p className="text-xs font-semibold text-brand-700 mb-1">Nhận xét của giáo viên</p>
                    <p className="text-xs text-brand-800 leading-relaxed">{submission.feedback}</p>
                  </div>
                )}

                {/* Submit form */}
                {!submitted && <AssignmentSubmit assignmentId={a.id} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
