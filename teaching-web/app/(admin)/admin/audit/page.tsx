import Link from 'next/link'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { action?: string; entityType?: string; actorId?: string }
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const where: Record<string, unknown> = {}
  if (searchParams.action) where.action = searchParams.action
  if (searchParams.entityType) where.entityType = searchParams.entityType
  if (searchParams.actorId) where.actorId = searchParams.actorId

  const [logs, actions, entityTypes, actors] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { actor: { select: { name: true, email: true } } },
    }),
    db.auditLog.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    }),
    db.auditLog.findMany({
      distinct: ['entityType'],
      select: { entityType: true },
      orderBy: { entityType: 'asc' },
    }),
    db.user.findMany({
      where: { auditLogs: { some: {} } },
      select: { id: true, name: true, email: true },
      take: 100,
    }),
  ])

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          200 hoạt động gần nhất. Lọc theo action / entity / actor.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lọc</CardTitle>
          <CardDescription>
            Mọi field hỗ trợ filter server-side; reset bằng nút bên phải.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-2 md:grid-cols-4">
            <select
              name="action"
              defaultValue={searchParams.action ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All actions</option>
              {actions.map((a) => (
                <option key={a.action} value={a.action}>
                  {a.action}
                </option>
              ))}
            </select>
            <select
              name="entityType"
              defaultValue={searchParams.entityType ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All entity types</option>
              {entityTypes.map((e) => (
                <option key={e.entityType} value={e.entityType}>
                  {e.entityType}
                </option>
              ))}
            </select>
            <select
              name="actorId"
              defaultValue={searchParams.actorId ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All actors</option>
              {actors.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" className="flex-1">
                Filter
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/audit">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Không có log phù hợp.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[180px]">When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="align-top">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.actor.name ?? log.actor.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{log.entityType}</div>
                    <div className="text-muted-foreground font-mono mt-0.5 break-all">
                      {log.entityId}
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {log.beforeJson || log.afterJson ? (
                      <details>
                        <summary className="cursor-pointer text-foreground">View</summary>
                        <pre className="mt-1 max-w-xs whitespace-pre-wrap break-all">
                          {log.beforeJson && `before: ${log.beforeJson}\n`}
                          {log.afterJson && `after: ${log.afterJson}`}
                        </pre>
                      </details>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
