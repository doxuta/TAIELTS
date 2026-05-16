'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Plus, Save, Trash2 } from 'lucide-react'
import { BLOCK_TYPES_V1, blockTypeLabel, parseBlockContent } from '@/lib/modules'
import { CitationList, type CitationWithSource } from '@/components/sources/CitationList'
import { CitationAttacher } from '@/components/sources/CitationAttacher'

type Block = {
  id: string
  type: string
  title: string
  contentJson: string | null
  order: number
  estimatedMinutes: number | null
}

interface Props {
  moduleId: string
  blocks: Block[]
  citationsByBlock: Record<string, CitationWithSource[]>
  viewerRole: string
  moduleStatus: string
}

const INPUT =
  'w-full rounded-lg border border-surface-border bg-surface-primary px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'

const readOnly = (moduleStatus: string, role: string) =>
  moduleStatus === 'PUBLISHED' && role !== 'ADMIN'

export function BlockManager({
  moduleId,
  blocks,
  citationsByBlock,
  viewerRole,
  moduleStatus,
}: Props) {
  const router = useRouter()
  const locked = readOnly(moduleStatus, viewerRole)

  const [adding, setAdding] = useState(false)
  const [addType, setAddType] = useState<string>('GRAMMAR_NOTE')
  const [addTitle, setAddTitle] = useState('')
  const [addBody, setAddBody] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function addBlock() {
    setAddError(null)
    if (!addTitle.trim()) {
      setAddError('Title is required')
      return
    }
    setPending(true)
    const res = await fetch(`/api/modules/${moduleId}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: addType,
        title: addTitle.trim(),
        content: { body: addBody },
      }),
    })
    setPending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setAddError(data?.error ?? 'Failed to add block')
      return
    }
    setAddTitle('')
    setAddBody('')
    setAdding(false)
    router.refresh()
  }

  return (
    <section className="rounded-xl border border-surface-border bg-surface-primary p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink-primary">Blocks ({blocks.length})</h2>
        {!locked && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-3 w-3" /> Add block
          </button>
        )}
      </div>

      {locked && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 border border-amber-200">
          Module đang PUBLISHED — chỉ ADMIN mới chỉnh sửa được. Bạn có thể xem nhưng không edit.
        </p>
      )}

      {adding && (
        <div className="rounded-lg border border-dashed border-surface-border bg-surface-secondary p-3 space-y-2">
          <div className="grid gap-2 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary">
              Block type
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value)}
                className={INPUT}
              >
                {BLOCK_TYPES_V1.map((t) => (
                  <option key={t} value={t}>
                    {blockTypeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary">
              Title
              <input
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                className={INPUT}
                placeholder={
                  addType === 'GRAMMAR_NOTE'
                    ? 'Present perfect — form & use'
                    : 'Short reading: A new habit'
                }
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-secondary">
            Body (markdown ok)
            <textarea
              value={addBody}
              onChange={(e) => setAddBody(e.target.value)}
              rows={5}
              className={INPUT}
              placeholder="Viết nội dung block..."
            />
          </label>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addBlock}
              disabled={pending}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {pending ? 'Saving...' : 'Save block'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-md border border-surface-border bg-surface-primary px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-tertiary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {blocks.length === 0 ? (
        <p className="text-sm text-ink-tertiary">Chưa có block nào.</p>
      ) : (
        <ul className="space-y-2">
          {blocks.map((b) => (
            <li key={b.id}>
              <BlockRow
                moduleId={moduleId}
                block={b}
                citations={citationsByBlock[b.id] ?? []}
                viewerRole={viewerRole}
                locked={locked}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function BlockRow({
  moduleId,
  block,
  citations,
  viewerRole,
  locked,
}: {
  moduleId: string
  block: Block
  citations: CitationWithSource[]
  viewerRole: string
  locked: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(block.title)
  const [body, setBody] = useState(parseBlockContent(block.contentJson).body ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setError(null)
    setPending(true)
    const res = await fetch(`/api/modules/${moduleId}/blocks/${block.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content: { body } }),
    })
    setPending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? 'Save failed')
      return
    }
    setEditing(false)
    router.refresh()
  }

  async function remove() {
    if (!confirm('Xoá block này?')) return
    setPending(true)
    const res = await fetch(`/api/modules/${moduleId}/blocks/${block.id}`, {
      method: 'DELETE',
    })
    setPending(false)
    if (res.ok) router.refresh()
  }

  return (
    <div className="rounded-lg border border-surface-border bg-surface-secondary p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-md p-1 text-ink-tertiary hover:bg-surface-tertiary"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-secondary border border-surface-border">
          {blockTypeLabel(block.type)}
        </span>
        <h3 className="font-medium text-ink-primary">{block.title}</h3>
        <span className="ml-auto text-xs text-ink-tertiary">order {block.order}</span>
        {!locked && (
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="text-xs text-ink-tertiary hover:text-ink-primary"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        )}
        {!locked && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-ink-tertiary hover:text-red-600 disabled:opacity-50"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={INPUT}
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className={INPUT}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Save className="h-3 w-3" /> Save
              </button>
            </div>
          ) : (
            <div className="rounded-md bg-surface-primary p-3 text-sm text-ink-primary whitespace-pre-wrap">
              {parseBlockContent(block.contentJson).body ?? (
                <span className="text-ink-tertiary">Trống.</span>
              )}
            </div>
          )}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
                Citations
              </h4>
              {!locked && (
                <CitationAttacher attachedToType="LESSON_BLOCK" attachedToId={block.id} />
              )}
            </div>
            <CitationList
              citations={citations}
              viewerRole={viewerRole}
              emptyMessage="Chưa gắn nguồn cho block này."
            />
          </div>
        </div>
      )}
    </div>
  )
}
