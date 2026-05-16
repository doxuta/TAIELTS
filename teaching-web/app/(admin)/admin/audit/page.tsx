import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminAuditPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { actor: { select: { name: true, email: true } } },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-ink-primary">Audit log</h1>
        <p className="text-sm text-ink-tertiary">100 hoạt động gần nhất trên toàn hệ thống.</p>
      </header>

      {logs.length === 0 ? (
        <p className="text-sm text-ink-tertiary">Chưa có hoạt động.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-border bg-surface-primary">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary text-left text-xs uppercase text-ink-tertiary">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-surface-border">
                  <td className="px-3 py-2 text-xs text-ink-tertiary">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3 py-2">{log.actor.name ?? log.actor.email}</td>
                  <td className="px-3 py-2 font-mono text-xs">{log.action}</td>
                  <td className="px-3 py-2 text-xs text-ink-secondary">
                    {log.entityType} · {log.entityId}
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
