import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ModuleStatusBadge } from '@/components/modules/StatusBadge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/teacher/students">
          <ArrowLeft className="w-3 h-3 mr-1" /> Back
        </Link>
      </Button>

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {student.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{student.fullName}</h1>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {student.occupation ?? '—'} · {student.user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tháng {student.currentMonth}/12 · Tuần {student.currentWeek} ·{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{student.currentPhase}</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Modules assigned</CardTitle>
          <AssignModuleAction studentId={student.id} modules={publishedModules} />
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
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
                    className="rounded-md border bg-muted/30 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/builder/modules/${a.moduleId}`}
                        className="font-semibold hover:text-primary"
                      >
                        {a.module.title}
                      </Link>
                      <ModuleStatusBadge status={a.module.status} />
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                        {a.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {done}/{total} block · {pct}%
                      </span>
                    </div>
                    {a.teacherNote && (
                      <p className="mt-1 text-xs text-muted-foreground">Note: {a.teacherNote}</p>
                    )}
                    {a.dueDate && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
