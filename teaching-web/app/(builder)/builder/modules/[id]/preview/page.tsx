import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Clock } from 'lucide-react'
import { db } from '@/lib/db'
import { blockTypeLabel, parseBlockContent } from '@/lib/modules'
import { CitationList, type CitationWithSource } from '@/components/sources/CitationList'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
          <Link href={`/builder/modules/${module.id}`}>
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to builder
          </Link>
        </Button>
        <Badge variant="warning">Student preview</Badge>
      </div>

      <Card>
        <CardContent className="p-5 space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{module.title}</h1>
          {module.summary && <p className="text-sm text-muted-foreground">{module.summary}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
            {module.skill && <Badge variant="outline" className="text-[10px]">{module.skill}</Badge>}
            {module.cefrLevel && <Badge variant="outline" className="text-[10px]">{module.cefrLevel}</Badge>}
            {module.targetBand != null && <span>Target band {module.targetBand}</span>}
            {module.estimatedMinutes != null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {module.estimatedMinutes} phút
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {module.blocks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Module chưa có block.
          </CardContent>
        </Card>
      ) : (
        <ol className="space-y-3">
          {module.blocks.map((b, idx) => {
            const content = parseBlockContent(b.contentJson)
            return (
              <li key={b.id}>
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      <Badge className="text-[10px] uppercase tracking-wide">
                        {idx + 1}. {blockTypeLabel(b.type)}
                      </Badge>
                      <h2 className="font-semibold">{b.title}</h2>
                    </div>
                    {content.body && (
                      <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap mb-3">
                        {content.body}
                      </div>
                    )}
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <BookOpen className="w-3 h-3" /> Nguồn tham chiếu
                      </div>
                      <CitationList
                        citations={byBlock.get(b.id) ?? []}
                        viewerRole="STUDENT"
                        emptyMessage="Block này không có nguồn ngoài."
                      />
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
