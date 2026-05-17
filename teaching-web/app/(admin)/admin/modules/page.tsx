import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Layers, ArrowUpRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ModuleRowActions } from './ModuleRowActions'

export const dynamic = 'force-dynamic'

const STATUSES = ['ALL', 'DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'] as const

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  PUBLISHED: 'success',
  IN_REVIEW: 'warning',
  DRAFT: 'secondary',
  ARCHIVED: 'outline',
}

interface PageProps {
  searchParams: { status?: string }
}

export default async function AdminModulesPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const status = searchParams.status
  const where: Record<string, unknown> = {}
  if (status && status !== 'ALL') where.status = status

  const [modules, counts] = await Promise.all([
    db.learningModule.findMany({
      where,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: 100,
      include: {
        _count: { select: { blocks: true } },
      },
    }),
    db.learningModule.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))
  const pendingReviewCount = countMap.IN_REVIEW ?? 0

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" /> Modules
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review queue: approve / reject / archive learning modules.{' '}
          {pendingReviewCount > 0 && (
            <span className="text-amber-500 font-medium">
              {pendingReviewCount} module đang chờ review.
            </span>
          )}
        </p>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter</CardTitle>
          <CardDescription>Lọc theo status. PUBLISHED đã release cho học viên.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const active = (status ?? 'ALL') === s
              const count = s === 'ALL' ? modules.length : countMap[s] ?? 0
              return (
                <Button
                  key={s}
                  asChild
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                >
                  <Link href={`/admin/modules?status=${s}`}>
                    {s.replaceAll('_', ' ')}
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {count}
                    </Badge>
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {modules.length} module{modules.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            Approve sẽ chuyển module sang PUBLISHED + tăng version + ghi audit log.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {modules.length === 0 ? (
            <p className="px-6 pb-4 text-sm text-muted-foreground">
              Không có module nào ở status này.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{m.title}</p>
                          {m.summary && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {m.summary}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {[m.skill, m.cefrLevel, m.targetBand ? `Band ${m.targetBand}` : null]
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[m.status] ?? 'secondary'}>
                        {m.status.replaceAll('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{m._count.blocks}</TableCell>
                    <TableCell className="tabular-nums">v{m.version}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(m.updatedAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/builder/modules/${m.id}/preview`}>
                            Preview <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </Button>
                        <ModuleRowActions
                          moduleId={m.id}
                          status={m.status}
                          blockCount={m._count.blocks}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
