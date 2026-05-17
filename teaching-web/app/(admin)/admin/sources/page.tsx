import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { db } from '@/lib/db'
import { SourceCard } from '@/components/sources/SourceCard'
import { REVIEW_STATUSES, SOURCE_TYPES } from '@/lib/sources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { q?: string; type?: string; reviewStatus?: string }
}

export default async function AdminSourcesPage({ searchParams }: PageProps) {
  const where: Record<string, unknown> = {}
  if (searchParams.type && (SOURCE_TYPES as readonly string[]).includes(searchParams.type)) {
    where.type = searchParams.type
  }
  if (
    searchParams.reviewStatus &&
    (REVIEW_STATUSES as readonly string[]).includes(searchParams.reviewStatus)
  ) {
    where.reviewStatus = searchParams.reviewStatus
  }
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { provider: { contains: searchParams.q } },
      { url: { contains: searchParams.q } },
    ]
  }

  const sources = await db.source.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }],
    include: { _count: { select: { routes: true } } },
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Source Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý nguồn học tin cậy. Mọi thao tác review / publish / block được ghi audit log.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sources/new">
            <Plus className="h-4 w-4" />
            New source
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lọc</CardTitle>
          <CardDescription>Tìm theo tên, provider, URL; lọc theo loại + trạng thái review.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={searchParams.q ?? ''}
                placeholder="Tìm theo tên, provider, URL..."
                className="pl-8"
              />
            </div>
            <select
              name="type"
              defaultValue={searchParams.type ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All types</option>
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              name="reviewStatus"
              defaultValue={searchParams.reviewStatus ?? ''}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All statuses</option>
              {REVIEW_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {sources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Chưa có source nào.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/sources/new">
                <Plus className="h-3.5 w-3.5" /> Tạo source đầu tiên
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {sources.map((s) => (
            <li key={s.id}>
              <SourceCard
                source={s}
                showAdminControls
                href={`/admin/sources/${s.id}`}
              >
                <div className="text-xs text-muted-foreground">
                  {s._count.routes} route{s._count.routes === 1 ? '' : 's'}
                </div>
              </SourceCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
