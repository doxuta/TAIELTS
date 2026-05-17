'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Plus, Save, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { BLOCK_TYPES_V1, blockTypeLabel, parseBlockContent } from '@/lib/modules'
import { CitationList, type CitationWithSource } from '@/components/sources/CitationList'
import { CitationAttacher } from '@/components/sources/CitationAttacher'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

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

const NATIVE_SELECT =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'

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
  const [addWritingTask, setAddWritingTask] = useState<'TASK_1' | 'TASK_2'>('TASK_2')
  const [addSpeakingPart, setAddSpeakingPart] = useState<1 | 2 | 3>(2)
  const [addError, setAddError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function addBlock() {
    setAddError(null)
    if (!addTitle.trim()) {
      setAddError('Title is required')
      return
    }
    setPending(true)
    const content: Record<string, unknown> = { body: addBody }
    if (addType === 'WRITING_PROMPT') content.writingTaskType = addWritingTask
    if (addType === 'SPEAKING_PROMPT') content.speakingPart = addSpeakingPart

    const res = await fetch(`/api/modules/${moduleId}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: addType, title: addTitle.trim(), content }),
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Blocks ({blocks.length})</CardTitle>
        {!locked && !adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-3 h-3 mr-1" /> Add block
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {locked && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Module đang PUBLISHED — chỉ ADMIN mới chỉnh sửa được. Bạn có thể xem nhưng không edit.</p>
          </div>
        )}

        {adding && (
          <div className="rounded-md border border-dashed bg-muted/30 p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Block type</Label>
                <select
                  value={addType}
                  onChange={(e) => setAddType(e.target.value)}
                  className={NATIVE_SELECT}
                >
                  {BLOCK_TYPES_V1.map((t) => (
                    <option key={t} value={t}>{blockTypeLabel(t)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder={
                    addType === 'GRAMMAR_NOTE'
                      ? 'Present perfect — form & use'
                      : 'Short reading: A new habit'
                  }
                />
              </div>
            </div>

            {addType === 'WRITING_PROMPT' && (
              <div className="space-y-1.5">
                <Label>Writing task</Label>
                <select
                  value={addWritingTask}
                  onChange={(e) => setAddWritingTask(e.target.value as 'TASK_1' | 'TASK_2')}
                  className={NATIVE_SELECT}
                >
                  <option value="TASK_2">TASK 2 (essay)</option>
                  <option value="TASK_1">TASK 1 (academic / general)</option>
                </select>
              </div>
            )}

            {addType === 'SPEAKING_PROMPT' && (
              <div className="space-y-1.5">
                <Label>Speaking part</Label>
                <select
                  value={addSpeakingPart}
                  onChange={(e) => setAddSpeakingPart(Number(e.target.value) as 1 | 2 | 3)}
                  className={NATIVE_SELECT}
                >
                  <option value={1}>Part 1 — Interview</option>
                  <option value={2}>Part 2 — Long turn (cue card)</option>
                  <option value={3}>Part 3 — Discussion</option>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>
                {addType === 'WRITING_PROMPT' || addType === 'SPEAKING_PROMPT'
                  ? 'Prompt'
                  : 'Body (markdown ok)'}
              </Label>
              <Textarea
                value={addBody}
                onChange={(e) => setAddBody(e.target.value)}
                rows={5}
                placeholder={
                  addType === 'WRITING_PROMPT'
                    ? 'Some people think... Discuss both views and give your opinion.'
                    : addType === 'SPEAKING_PROMPT'
                      ? 'Describe a place you visited recently. You should say...'
                      : 'Viết nội dung block...'
                }
              />
            </div>

            {addError && <p className="text-xs text-destructive">{addError}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={addBlock} disabled={pending}>
                {pending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                {pending ? 'Saving...' : 'Save block'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có block nào.</p>
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
      </CardContent>
    </Card>
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
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
          {blockTypeLabel(block.type)}
        </Badge>
        <h3 className="font-medium">{block.title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">order {block.order}</span>
        {!locked && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        )}
        {!locked && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={remove}
            disabled={pending}
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          {editing ? (
            <div className="space-y-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button size="sm" onClick={save} disabled={pending}>
                {pending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                Save
              </Button>
            </div>
          ) : (
            <div className="rounded-md bg-card p-3 text-sm whitespace-pre-wrap">
              {parseBlockContent(block.contentJson).body ?? (
                <span className="text-muted-foreground">Trống.</span>
              )}
            </div>
          )}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
