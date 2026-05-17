import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Eye } from 'lucide-react'
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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/builder/modules">
          <ArrowLeft className="w-3 h-3 mr-1" /> Back
        </Link>
      </Button>

      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{module.title}</h1>
            <ModuleStatusBadge status={module.status} />
            {module.skill && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{module.skill}</Badge>
            )}
            {module.cefrLevel && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{module.cefrLevel}</Badge>
            )}
          </div>
          {module.summary && <p className="text-sm text-muted-foreground">{module.summary}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>slug: <code className="rounded bg-muted px-1 py-0.5 font-mono">{module.slug}</code></span>
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
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/builder/modules/${module.id}/preview`}>
                <Eye className="w-3 h-3 mr-1" /> Preview as student
              </Link>
            </Button>
            <PublishControls
              moduleId={module.id}
              status={module.status}
              viewerRole={role}
              blockCount={module.blocks.length}
            />
          </div>
        </CardContent>
      </Card>

      <BlockManager
        moduleId={module.id}
        blocks={module.blocks}
        citationsByBlock={Object.fromEntries(
          Array.from(citationsByBlock.entries()).map(([k, v]) => [k, v])
        )}
        viewerRole={role}
        moduleStatus={module.status}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Audit log (recent)</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {recentAudit.length === 0 ? (
            <p className="px-6 text-sm text-muted-foreground">Chưa có hoạt động.</p>
          ) : (
            <ul className="divide-y">
              {recentAudit.map((a) => (
                <li key={a.id} className="px-6 py-2 text-xs flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[11px]">{a.action}</Badge>
                  <span className="text-muted-foreground">
                    on {a.entityType} by {a.actor.name ?? a.actor.email}
                  </span>
                  <span className="ml-auto text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString('vi-VN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
