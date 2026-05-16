import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function StudentFeedbackInboxPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') redirect('/login')

  const list = await db.aIFeedback.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="page-header animate-fade-up">
        <h1 className="page-title">AI feedback của bạn</h1>
        <p className="page-subtitle">
          Lưu lại các lần AI chấm. Giáo viên có thể review để confirm hoặc ghi chú thêm.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-tertiary">
          Chưa có feedback. Hoàn thành một WRITING_PROMPT hoặc SPEAKING_PROMPT trong Today Plan để
          AI chấm cho bạn.
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((f) => (
            <li key={f.id}>
              <Link
                href={`/student/feedback/${f.id}`}
                className="block card p-4 hover:border-brand-300 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-ink-tertiary">{f.kind}</span>
                  <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-secondary">
                    {f.teacherStatus.replaceAll('_', ' ')}
                  </span>
                  {f.overallBand != null && (
                    <span className="ml-auto font-bold text-ink">Band {f.overallBand.toFixed(1)}</span>
                  )}
                </div>
                {f.summaryFeedback && (
                  <p className="text-sm text-ink mt-1 line-clamp-2">{f.summaryFeedback}</p>
                )}
                <p className="text-xs text-ink-tertiary mt-1">
                  {new Date(f.createdAt).toLocaleString('vi-VN')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
