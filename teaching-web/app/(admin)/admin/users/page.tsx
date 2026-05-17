import { Search } from 'lucide-react'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { RoleSelector } from './RoleSelector'

export const dynamic = 'force-dynamic'

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT'] as const

interface PageProps {
  searchParams: { role?: string; q?: string }
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user.id

  const where: Record<string, unknown> = {}
  if (searchParams.role && (ROLES as readonly string[]).includes(searchParams.role)) {
    where.role = searchParams.role
  }
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { email: { contains: searchParams.q } },
    ]
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      studentProfile: { select: { fullName: true, teacherId: true } },
    },
  })

  const adminCount = await db.user.count({ where: { role: 'ADMIN' } })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {users.length} người dùng. Đổi role được ghi audit log với action{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">USER_ROLE_CHANGE</code>.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lọc</CardTitle>
          <CardDescription>Tìm theo name hoặc email; lọc theo role.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={searchParams.q ?? ''}
                placeholder="Search name hoặc email..."
                className="pl-8"
              />
            </div>
            <select
              name="role"
              defaultValue={searchParams.role ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Không có user nào khớp bộ lọc.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[180px]">Role</TableHead>
                <TableHead className="w-[110px]">Created</TableHead>
                <TableHead>Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <RoleSelector
                      userId={u.id}
                      currentRole={u.role}
                      selfId={currentUserId}
                      isLastAdmin={u.role === 'ADMIN' && adminCount <= 1}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-xs">
                    {u.studentProfile ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Badge variant="secondary">Student</Badge>
                        <span className="text-muted-foreground">
                          {u.studentProfile.fullName}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
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
