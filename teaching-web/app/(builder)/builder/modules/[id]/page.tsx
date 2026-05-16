import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Eye } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ModuleStatusBadge } from '@/components/modules/StatusBadge'
import { BlockManager } from './BlockManager'
import { PublishControls } from './PublishControls'

export const dynamic = 'force-dynamic'

export default async function BuilderModuleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role ?? 'TEACHER'

  const module = await db.learningModule.findUnique({
    where: { id: params.id },
    include: {
      blocks: { orderBy: { order: 'asc' } },
      createdBy: { select: { name: true, email: true } },
      publishedBy: { select: { name: true, email: true } },
    },
  })
  if (!module) notFound()

  const blockIds = module.blocks.map((b) => b.id)
  const citationsRaw = blockIds.length
    ? await db.citation.findMany({
        where: { attachedToType: 'LESSON_BLOCK', attachedToId: { in: blockIds } },
        include: { sourceRoute: { include: { source: true } } },
        orderBy: { createdAt: 'asc' },
      })
    : []

  const citationsByBlock = new Map<string, typeof citationsRaw>()
  for (const c of citationsRaw) {
    const list = citationsByBlock.get(c.attachedToId) ?? []
    list.push(c)
    citationsByBlock.set(c.attachedToId, list)
  }

  const recentAudit = await db.auditLog.findMany({
    where: {
      OR: [
        { entityType: 'MODULE', entityId: module.id },
        { entityType: 'BLOCK', entityId: { in: blockIds.length ? blockIds : ['__none__'] } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { actor: { select: { name: true, email: true } } },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <Link
        href="/builder/modules"
        className="inline-flex items-center gap-1 text-sm text-ink-tertiary hover:text-ink-primary"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <header className="rounded-xl border border-surface-border bg-surface-primary p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-ink-primary">{module.title}</h1>
          <ModuleStatusBadge status={module.status} />
          {module.skill && (
            <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-secondary">
              {module.skill}
            </span>
          )}
          {module.cefrLevel && (
            <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-secondary">
              {module.cefrLevel}
            </span>
          )}
        </div>
        {module.summary && <p className="mt-2 text-sm text-ink-secondary">{module.summary}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-tertiary">
          <span>slug: {module.slug}</span>
          <span>version v{module.version}</span>
          {module.week != null && <span>week {module.week}</span>}
          {module.targetBand != null && <span>target band {module.targetBand}</span>}
          {module.estimatedMinutes != null && <span>{module.estimatedMinutes} phút</span>}
          <span>created by {module.createdBy.name ?? module.createdBy.email}</span>
          {module.publishedBy && (
            <span>
              published by {module.publishedBy.name ?? module.publishedBy.email} ·{' '}
              {module.publishedAt && new Date(module.publishedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/builder/modules/${module.id}/preview`}
            className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-surface-secondary px-3 py-1.5 text-xs font-medium hover:bg-surface-tertiary"
          >
            <Eye className="h-3 w-3" /> Preview as student
          </Link>
          <PublishControls
            moduleId={module.id}
            status={module.status}
            viewerRole={role}
            blockCount={module.blocks.length}
          />
        </div>
      </header>

      <BlockManager
        moduleId={module.id}
        blocks={module.blocks}
        citationsByBlock={Object.fromEntries(
          Array.from(citationsByBlock.entries()).map(([k, v]) => [k, v])
        )}
        viewerRole={role}
        moduleStatus={module.status}
      />

      <section className="rounded-xl border border-surface-border bg-surface-primary p-4">
        <h2 className="font-semibold text-ink-primary mb-2">Audit log (recent)</h2>
        {recentAudit.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Chưa có hoạt động.</p>
        ) : (
          <ul className="space-y-1 text-xs text-ink-secondary">
            {recentAudit.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-ink-primary">{a.action}</span>
                <span className="text-ink-tertiary">
                  on {a.entityType} by {a.actor.name ?? a.actor.email} ·{' '}
                  {new Date(a.createdAt).toLocaleString('vi-VN')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
