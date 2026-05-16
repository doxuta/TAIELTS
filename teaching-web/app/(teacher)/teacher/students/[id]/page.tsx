import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ModuleStatusBadge } from '@/components/modules/StatusBadge'
import { AssignModuleAction } from './AssignModuleAction'

export const dynamic = 'force-dynamic'

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const student = await db.student.findFirst({
    where: { id: params.id, teacherId: session!.user.id },
    include: { user: true },
  })
  if (!student) notFound()

  const assignments = await db.moduleAssignment.findMany({
    where: { studentId: student.id },
    include: {
      module: { include: { _count: { select: { blocks: true } } } },
      blockProgress: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const publishedModules = await db.learningModule.findMany({
    where: {
      status: 'PUBLISHED',
      id: { notIn: assignments.map((a) => a.moduleId) },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Link
        href="/teacher/students"
        className="inline-flex items-center gap-1 text-sm text-ink-tertiary hover:text-ink-primary"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <header className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="page-title">{student.fullName}</h1>
            <p className="text-sm text-ink-tertiary">
              {student.occupation ?? '—'} · {student.user.email}
            </p>
            <p className="text-xs text-ink-tertiary mt-1">
              Tháng {student.currentMonth}/12 · Tuần {student.currentWeek} ·{' '}
              {student.currentPhase}
            </p>
          </div>
        </div>
      </header>

      <section className="card p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-ink-primary">Modules assigned</h2>
          <AssignModuleAction studentId={student.id} modules={publishedModules} />
        </div>
        {assignments.length === 0 ? (
          <p className="text-sm text-ink-tertiary">
            Chưa có module nào được giao. Chọn từ kho module đã publish ở nút trên.
          </p>
        ) : (
          <ul className="space-y-2">
            {assignments.map((a) => {
              const total = a.module._count.blocks
              const done = a.blockProgress.filter((p) => p.status === 'COMPLETED').length
              const pct = total === 0 ? 0 : Math.round((done / total) * 100)
              return (
                <li
                  key={a.id}
                  className="rounded-xl border border-surface-border bg-surface-secondary p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/builder/modules/${a.moduleId}`}
                      className="font-semibold text-ink-primary hover:text-brand-600"
                    >
                      {a.module.title}
                    </Link>
                    <ModuleStatusBadge status={a.module.status} />
                    <span className="rounded-full bg-surface-primary border border-surface-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-secondary">
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-surface-border overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-tertiary tabular-nums">
                      {done}/{total} block · {pct}%
                    </span>
                  </div>
                  {a.teacherNote && (
                    <p className="mt-1 text-xs text-ink-tertiary">Note: {a.teacherNote}</p>
                  )}
                  {a.dueDate && (
                    <p className="mt-1 text-xs text-ink-tertiary">
                      Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
