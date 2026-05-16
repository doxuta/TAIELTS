import Link from 'next/link'
import { Plus } from 'lucide-react'
import { db } from '@/lib/db'
import { SourceCard } from '@/components/sources/SourceCard'
import { REVIEW_STATUSES, SOURCE_TYPES } from '@/lib/sources'

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
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Source Registry</h1>
          <p className="text-sm text-ink-tertiary">
            Quản lý nguồn học tin cậy. Mọi thao tác review/publish/block đều được ghi audit log.
          </p>
        </div>
        <Link
          href="/admin/sources/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New source
        </Link>
      </header>

      <form className="flex flex-wrap gap-2 mb-4">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Tìm theo tên, provider, URL..."
          className="flex-1 min-w-[200px] rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
        />
        <select
          name="type"
          defaultValue={searchParams.type ?? ''}
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
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
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {REVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
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

      {sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border bg-surface-primary p-10 text-center">
          <p className="text-ink-secondary">Chưa có source nào. Tạo source đầu tiên để bắt đầu.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sources.map((s) => (
            <li key={s.id}>
              <SourceCard
                source={s}
                showAdminControls
                href={`/admin/sources/${s.id}`}
              >
                <div className="text-xs text-ink-tertiary">
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
