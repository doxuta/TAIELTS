import Link from 'next/link'
import { Plus, Layers } from 'lucide-react'
import { db } from '@/lib/db'
import { MODULE_STATUSES, moduleStatusLabel } from '@/lib/modules'
import { ModuleStatusBadge } from '@/components/modules/StatusBadge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { status?: string; q?: string }
}

export default async function BuilderModulesPage({ searchParams }: PageProps) {
  const where: Record<string, unknown> = {}
  if (
    searchParams.status &&
    (MODULE_STATUSES as readonly string[]).includes(searchParams.status)
  ) {
    where.status = searchParams.status
  }
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { slug: { contains: searchParams.q } },
    ]
  }

  const modules = await db.learningModule.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }],
    include: { _count: { select: { blocks: true } } },
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Modules
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Học liệu được đóng gói thành module. Mỗi module có nhiều block và có thể gắn citation.
          </p>
        </div>
        <Button asChild>
          <Link href="/builder/modules/new">
            <Plus className="w-4 h-4 mr-1" /> New module
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter</CardTitle>
          <CardDescription>Tìm theo title/slug; lọc theo status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-2">
            <Input
              name="q"
              defaultValue={searchParams.q ?? ''}
              placeholder="Search title hoặc slug..."
              className="flex-1 min-w-[200px]"
            />
            <select
              name="status"
              defaultValue={searchParams.status ?? ''}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All statuses</option>
              {MODULE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {moduleStatusLabel(s)}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có module nào.</p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/builder/modules/new">
                <Plus className="w-4 h-4 mr-1" /> Tạo module đầu tiên
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/builder/modules/${m.id}`}
                className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{m.title}</h3>
                  <ModuleStatusBadge status={m.status} />
                  {m.skill && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {m.skill}
                    </Badge>
                  )}
                  {m.cefrLevel && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {m.cefrLevel}
                    </Badge>
                  )}
                </div>
                {m.summary && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.summary}</p>
                )}
                <div className="mt-1 text-xs text-muted-foreground">
                  {m._count.blocks} block{m._count.blocks === 1 ? '' : 's'} · v{m.version} ·
                  cập nhật {new Date(m.updatedAt).toLocaleDateString('vi-VN')}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
