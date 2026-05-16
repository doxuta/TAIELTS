import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Clock } from 'lucide-react'
import { db } from '@/lib/db'
import { blockTypeLabel, parseBlockContent } from '@/lib/modules'
import { CitationList, type CitationWithSource } from '@/components/sources/CitationList'

export const dynamic = 'force-dynamic'

export default async function ModulePreviewPage({ params }: { params: { id: string } }) {
  const module = await db.learningModule.findUnique({
    where: { id: params.id },
    include: { blocks: { orderBy: { order: 'asc' } } },
  })
  if (!module) notFound()

  const blockIds = module.blocks.map((b) => b.id)
  const citationsRaw = blockIds.length
    ? ((await db.citation.findMany({
        where: { attachedToType: 'LESSON_BLOCK', attachedToId: { in: blockIds } },
        include: { sourceRoute: { include: { source: true } } },
        orderBy: { createdAt: 'asc' },
      })) as unknown as CitationWithSource[])
    : []

  const byBlock = new Map<string, CitationWithSource[]>()
  for (const c of citationsRaw) {
    const list = byBlock.get(c.attachedToId as string) ?? []
    list.push(c)
    byBlock.set(c.attachedToId as string, list)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/builder/modules/${module.id}`}
          className="inline-flex items-center gap-1 text-sm text-ink-tertiary hover:text-ink-primary"
        >
          <ArrowLeft className="h-3 w-3" /> Back to builder
        </Link>
        <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
          Student preview
        </span>
      </div>

      <header className="rounded-xl border border-surface-border bg-surface-primary p-5">
        <h1 className="text-2xl font-bold text-ink-primary">{module.title}</h1>
        {module.summary && <p className="mt-2 text-sm text-ink-secondary">{module.summary}</p>}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-tertiary">
          {module.skill && <span>{module.skill}</span>}
          {module.cefrLevel && <span>{module.cefrLevel}</span>}
          {module.targetBand != null && <span>Target band {module.targetBand}</span>}
          {module.estimatedMinutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {module.estimatedMinutes} phút
            </span>
          )}
        </div>
      </header>

      {module.blocks.length === 0 ? (
        <p className="text-sm text-ink-tertiary">Module chưa có block.</p>
      ) : (
        <ol className="space-y-4">
          {module.blocks.map((b, idx) => {
            const content = parseBlockContent(b.contentJson)
            return (
              <li
                key={b.id}
                className="rounded-xl border border-surface-border bg-surface-primary p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {idx + 1}. {blockTypeLabel(b.type)}
                  </span>
                  <h2 className="font-semibold text-ink-primary">{b.title}</h2>
                </div>
                {content.body && (
                  <div className="rounded-md bg-surface-secondary p-3 text-sm text-ink-primary whitespace-pre-wrap mb-3">
                    {content.body}
                  </div>
                )}
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
                    <BookOpen className="h-3 w-3" /> Nguồn tham chiếu
                  </div>
                  <CitationList
                    citations={byBlock.get(b.id) ?? []}
                    viewerRole="STUDENT"
                    emptyMessage="Block này không có nguồn ngoài."
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
