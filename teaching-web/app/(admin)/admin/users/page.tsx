import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-ink-primary">Users</h1>
        <p className="text-sm text-ink-tertiary">
          {users.length} người dùng. Đổi role được audit log với hành động USER_ROLE_CHANGE.
        </p>
      </header>

      <form className="flex flex-wrap gap-2 mb-4">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Search name hoặc email..."
          className="flex-1 min-w-[200px] rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
        />
        <select
          name="role"
          defaultValue={searchParams.role ?? ''}
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm font-medium hover:bg-surface-tertiary"
        >
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-surface-border bg-surface-primary">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary text-left text-xs uppercase text-ink-tertiary">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Profile</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-surface-border align-middle">
                <td className="px-3 py-2 font-medium text-ink-primary">{u.name ?? '—'}</td>
                <td className="px-3 py-2 text-ink-secondary">{u.email}</td>
                <td className="px-3 py-2">
                  <RoleSelector
                    userId={u.id}
                    currentRole={u.role}
                    selfId={currentUserId}
                    isLastAdmin={u.role === 'ADMIN' && adminCount <= 1}
                  />
                </td>
                <td className="px-3 py-2 text-xs text-ink-tertiary">
                  {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-3 py-2 text-xs text-ink-tertiary">
                  {u.studentProfile ? `Student · ${u.studentProfile.fullName}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
