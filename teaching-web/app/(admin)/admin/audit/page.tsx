import Link from 'next/link'
import { db } from '@/lib/db'

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
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-ink-primary">Audit log</h1>
        <p className="text-sm text-ink-tertiary">
          200 hoạt động gần nhất. Lọc theo action / entity type / actor.
        </p>
      </header>

      <form className="grid gap-2 mb-4 md:grid-cols-4">
        <select
          name="action"
          defaultValue={searchParams.action ?? ''}
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
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
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
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
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
        >
          <option value="">All actors</option>
          {actors.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm font-medium hover:bg-surface-tertiary"
          >
            Filter
          </button>
          <Link
            href="/admin/audit"
            className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm font-medium hover:bg-surface-tertiary"
          >
            Reset
          </Link>
        </div>
      </form>

      {logs.length === 0 ? (
        <p className="text-sm text-ink-tertiary">Không có log phù hợp.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-border bg-surface-primary">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary text-left text-xs uppercase text-ink-tertiary">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-surface-border align-top">
                  <td className="px-3 py-2 text-xs text-ink-tertiary whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3 py-2">{log.actor.name ?? log.actor.email}</td>
                  <td className="px-3 py-2 font-mono text-xs">{log.action}</td>
                  <td className="px-3 py-2 text-xs text-ink-secondary">
                    {log.entityType}
                    <br />
                    <span className="text-ink-tertiary font-mono">{log.entityId}</span>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-ink-tertiary">
                    {log.beforeJson || log.afterJson ? (
                      <details>
                        <summary className="cursor-pointer text-ink-secondary">View</summary>
                        <pre className="mt-1 max-w-xs whitespace-pre-wrap break-all">
                          {log.beforeJson && `before: ${log.beforeJson}\n`}
                          {log.afterJson && `after: ${log.afterJson}`}
                        </pre>
                      </details>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
