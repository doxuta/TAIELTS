import Link from 'next/link'
import { Plus } from 'lucide-react'
import { db } from '@/lib/db'
import { MODULE_STATUSES, moduleStatusLabel } from '@/lib/modules'
import { ModuleStatusBadge } from '@/components/modules/StatusBadge'

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
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Modules</h1>
          <p className="text-sm text-ink-tertiary">
            Học liệu được đóng gói thành module. Mỗi module có nhiều block và có thể gắn citation.
          </p>
        </div>
        <Link
          href="/builder/modules/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New module
        </Link>
      </header>

      <form className="flex flex-wrap gap-2 mb-4">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Search title hoặc slug..."
          className="flex-1 min-w-[200px] rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ''}
          className="rounded-md border border-surface-border bg-surface-primary px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {MODULE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {moduleStatusLabel(s)}
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

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border bg-surface-primary p-10 text-center">
          <p className="text-ink-secondary">Chưa có module nào.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/builder/modules/${m.id}`}
                className="block rounded-xl border border-surface-border bg-surface-primary p-3 hover:border-brand-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink-primary">{m.title}</h3>
                  <ModuleStatusBadge status={m.status} />
                  {m.skill && (
                    <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-secondary">
                      {m.skill}
                    </span>
                  )}
                  {m.cefrLevel && (
                    <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-secondary">
                      {m.cefrLevel}
                    </span>
                  )}
                </div>
                {m.summary && (
                  <p className="mt-1 text-sm text-ink-secondary line-clamp-2">{m.summary}</p>
                )}
                <div className="mt-1 text-xs text-ink-tertiary">
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
